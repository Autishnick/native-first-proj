import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DocumentSnapshot, Query } from 'firebase-admin/firestore';
import { FireStoreService } from 'src/common/database/firestore.service';
import { NotificationType } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FindAllTasksDto } from './dto/FindAllTasksDto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskData } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly tasksCollection;
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly firebaseService: FireStoreService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.tasksCollection = this.firebaseService.firestore.collection('tasks');
  }

  async create(
    createData: CreateTaskDto & {
      createdBy: string;
      createdByDisplayName: string;
    },
  ): Promise<Task> {
    const newTaskData: any = {
      ...createData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'open',
      title_lowercase: createData.title.toLowerCase(),
      bids: [],
    };

    if (createData.dueDate) {
      const date = new Date(createData.dueDate);
      if (!isNaN(date.getTime())) {
        newTaskData.dueDate = admin.firestore.Timestamp.fromDate(date);
      }
    }

    const docRef = await this.tasksCollection.add(newTaskData);
    const newDoc = await docRef.get();
    return this.docToTask(newDoc);
  }

  async findAll(queryDto: FindAllTasksDto): Promise<Task[]> {
    const { category, sort = 'date', order = 'desc', search } = queryDto;

    let query: Query = this.tasksCollection;

    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    if (snapshot.empty) return [];

    let tasks: Task[] = snapshot.docs.map((doc) => this.docToTask(doc));

    if (search) {
      const lowercaseSearch = search.toLowerCase();
      tasks = tasks.filter((task) =>
        task.title_lowercase.includes(lowercaseSearch),
      );
    }

    tasks.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      switch (sort) {
        case 'price':
          compareA = a.payment;
          compareB = b.payment;
          break;
        case 'alphabet':
          compareA = a.title_lowercase;
          compareB = b.title_lowercase;
          break;
        case 'date':
        default:
          compareA = a.createdAt.getTime();
          compareB = b.createdAt.getTime();
          break;
      }

      if (compareA < compareB) {
        return order === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return tasks;
  }

  async findOne(id: string): Promise<Task> {
    const doc = await this.tasksCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return this.docToTask(doc);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const docRef = this.tasksCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updateData: any = {
      ...updateTaskDto,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (updateTaskDto.dueDate) {
      updateData.dueDate = admin.firestore.Timestamp.fromDate(
        new Date(updateTaskDto.dueDate),
      );
    }

    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    return this.docToTask(updatedDoc);
  }

  async remove(id: string): Promise<{ message: string }> {
    const docRef = this.tasksCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await docRef.delete();
    return { message: `Task with ID ${id} successfully deleted.` };
  }

  async addBid(
    taskId: string,
    bidData: { bidAmount: number; workerId: string; workerName: string },
  ): Promise<{ message: string; bid: any }> {
    const taskRef = this.tasksCollection.doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const taskData = doc.data() as TaskData;
    if (!taskData) {
      throw new NotFoundException(`Task data missing for ID ${taskId}`);
    }

    const newBid = {
      ...bidData,
      createdAt: admin.firestore.Timestamp.now(),
    };

    try {
      await taskRef.update({
        bids: admin.firestore.FieldValue.arrayUnion(newBid),
      });

      const notificationPayload = {
        type: 'BID' as NotificationType,
        message: `${bidData.workerName} placed a bid on your task '${taskData.title}'`,
        recipientId: taskData.createdBy,
        recipientName: taskData.createdByDisplayName || 'Task Owner',
        senderId: bidData.workerId,
        senderName: bidData.workerName,
        taskId: taskId,
        bidAmount: bidData.bidAmount,
      };

      this.notificationsService.create(notificationPayload);

      return { message: 'Bid added successfully', bid: newBid };
    } catch (error) {
      this.logger.error(`Failed to add bid: ${error.message}`, error.stack);
      throw error;
    }
  }

  async assignTask(
    taskId: string,
    taskOwnerId: string,
    bid: { senderId: string; senderName: string; bidId?: string },
  ): Promise<Task> {
    const taskRef = this.tasksCollection.doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const taskData = doc.data() as TaskData;

    if (taskData.createdBy !== taskOwnerId) {
      throw new UnauthorizedException('You do not own this task');
    }

    const updateData = {
      assignedTo: bid.senderId,
      status: 'assigned',
      workerName: bid.senderName,
    };
    await taskRef.update(updateData);

    if (bid.bidId) {
      try {
        await this.firebaseService.firestore
          .collection('notifications')
          .doc(bid.bidId)
          .delete();
      } catch (err) {
        this.logger.warn(
          `Could not delete accepted notification: ${err.message}`,
        );
      }
    }

    const notificationPayload = {
      type: 'task_assigned' as NotificationType,
      message: `You have been assigned to the task "${taskData.title}"`,
      recipientId: bid.senderId,
      recipientName: bid.senderName,
      senderId: taskOwnerId,
      senderName: taskData.createdByDisplayName || 'Task Owner',
      taskId: taskId,
    };
    await this.notificationsService.create(notificationPayload);

    const otherBidsQuery = this.firebaseService.firestore
      .collection('notifications')
      .where('taskId', '==', taskId)
      .where('type', '==', 'BID');

    const otherBidsSnapshot = await otherBidsQuery.get();
    const batch = this.firebaseService.firestore.batch();
    otherBidsSnapshot.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    const updatedDoc = await taskRef.get();
    return this.docToTask(updatedDoc);
  }

  async declineBid(
    taskId: string,
    taskOwnerId: string,
    bid: { senderId: string; bidId?: string },
  ): Promise<{ message: string }> {
    const taskRef = this.tasksCollection.doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const taskData = doc.data() as TaskData;

    if (taskData.createdBy !== taskOwnerId) {
      throw new UnauthorizedException('You do not own this task');
    }

    const bidToRemove = taskData.bids.find((b) => b.workerId === bid.senderId);
    if (bidToRemove) {
      await taskRef.update({
        bids: admin.firestore.FieldValue.arrayRemove(bidToRemove),
      });
    }

    if (bid.bidId) {
      try {
        await this.firebaseService.firestore
          .collection('notifications')
          .doc(bid.bidId)
          .delete();
      } catch (err) {
        this.logger.warn(
          `Could not delete declined notification: ${err.message}`,
        );
      }
    }

    return { message: `Bid from ${bid.senderId} declined and removed.` };
  }

  private docToTask(doc: DocumentSnapshot): Task {
    const data = doc.data() as TaskData;
    const task: any = { id: doc.id, ...data };

    if (task.createdAt && typeof task.createdAt.toDate === 'function') {
      task.createdAt = task.createdAt.toDate();
    }
    if (task.updatedAt && typeof task.updatedAt.toDate === 'function') {
      task.updatedAt = task.updatedAt.toDate();
    }
    if (task.dueDate && typeof task.dueDate.toDate === 'function') {
      task.dueDate = task.dueDate.toDate();
    }

    if (Array.isArray(task.bids)) {
      task.bids = task.bids.map((bid) => {
        if (bid.createdAt && typeof bid.createdAt.toDate === 'function') {
          return { ...bid, createdAt: bid.createdAt.toDate() };
        }
        return bid;
      });
    }

    return task as Task;
  }
}
