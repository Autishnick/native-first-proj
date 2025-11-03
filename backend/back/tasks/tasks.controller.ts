// Per your request, all code and comments are in English.
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CreateTaskDto } from './dto/create-task.dto';
import type { PlaceBidDto } from './dto/place-bid.dto';
import type { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

import { User } from 'src/common/auth/decorators/user.decorator';
import { FirebaseAuthGuard } from 'src/common/auth/guards/firebase-auth.guard';
import type { UserProfile } from 'src/users/entities/user.entity';

import { FindAllTasksDto } from './dto/FindAllTasksDto';
import type { Task } from './entities/task.entity';

@UseGuards(FirebaseAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @User() user: UserProfile,
  ): Promise<Task> {
    const dataWithUser = {
      ...createTaskDto,
      createdBy: user.uid,
      createdByDisplayName: user.displayName,
    };
    return this.tasksService.create(dataWithUser);
  }

  @Get()
  async findAll(@Query() query: FindAllTasksDto): Promise<Task[]> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @User() user: UserProfile,
  ): Promise<Task> {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: UserProfile,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(id);
  }

  @Post(':id/bids')
  async addBid(
    @Param('id') taskId: string,
    @Body() placeBidDto: PlaceBidDto,
    @User() user: UserProfile,
  ): Promise<{ message: string; bid: any }> {
    const bidDataWithUser = {
      ...placeBidDto,
      workerId: user.uid,
      workerName: user.displayName,
    };
    return this.tasksService.addBid(taskId, bidDataWithUser);
  }

  // --- 1. ADD THIS METHOD FOR ASSIGNING A TASK ---
  @Patch(':id/assign')
  assignTask(
    @Param('id') taskId: string,
    @Body() bid: { senderId: string; senderName: string; bidId?: string },
    @User() user: UserProfile, // Get the task owner
  ) {
    // We pass the task owner's UID for a security check
    return this.tasksService.assignTask(taskId, user.uid, bid);
  }

  // --- 2. ADD THIS METHOD FOR DECLINING A BID ---
  @Patch(':id/decline')
  declineBid(
    @Param('id') taskId: string,
    @Body() bid: { senderId: string; bidId?: string },
    @User() user: UserProfile, // Get the task owner
  ) {
    return this.tasksService.declineBid(taskId, user.uid, bid);
  }
}
