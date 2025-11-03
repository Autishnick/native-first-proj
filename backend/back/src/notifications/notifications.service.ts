import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  CollectionReference,
  DocumentSnapshot,
  FieldValue,
} from 'firebase-admin/firestore';
import { FireStoreService } from '../common/database/firestore.service';
import { InternalCreateNotificationDto } from './dto/internal-create-notification.dto';
import { UpdateNotificationDto } from './dto/mark-as-read.dto';

import { Notification, NotificationData } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly notificationsCollection: CollectionReference<NotificationData>;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly firebaseService: FireStoreService) {
    this.notificationsCollection = this.firebaseService.firestore.collection(
      'notifications',
    ) as CollectionReference<NotificationData>;
  }

  async findAllByRecipient(recipientId: string): Promise<Notification[]> {
    const query = this.notificationsCollection
      .where('recipientId', '==', recipientId)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => this.docToNotification(doc));
  }

  async create(dto: InternalCreateNotificationDto) {
    const newNotification: NotificationData = {
      ...dto,
      bidAmount: dto.bidAmount || null,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
      recipientName: dto.recipientName || 'Task Owner',
    };

    try {
      const docRef = await this.notificationsCollection.add(newNotification);
      this.logger.log(
        `Notification created: ${docRef.id} for recipient ${dto.recipientId}`,
      );

      return { id: docRef.id, ...dto, read: false };
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId: string,
  ): Promise<Notification> {
    const docRef = this.notificationsCollection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const data = doc.data() as NotificationData;
    if (data.recipientId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update notification ${id} owned by ${data.recipientId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to modify this notification',
      );
    }

    await docRef.update({
      ...updateNotificationDto,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await docRef.get();
    return this.docToNotification(updatedDoc);
  }

  private docToNotification(doc: DocumentSnapshot): Notification {
    const data = doc.data() as NotificationData;

    const notification: any = {
      id: doc.id,
      ...data,
    };

    if (
      notification.createdAt &&
      typeof notification.createdAt.toDate === 'function'
    ) {
      notification.createdAt = notification.createdAt.toDate();
    }

    if (
      notification.updatedAt &&
      typeof notification.updatedAt.toDate === 'function'
    ) {
      notification.updatedAt = notification.updatedAt.toDate();
    }

    return notification as Notification;
  }
}
