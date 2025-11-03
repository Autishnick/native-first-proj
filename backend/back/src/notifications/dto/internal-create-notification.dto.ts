import { NotificationType } from '../entities/notification.entity';

export class InternalCreateNotificationDto {
  message: string;
  recipientId: string;
  recipientName: string;
  senderId: string;
  senderName: string;
  taskId: string;
  type: NotificationType;
  bidAmount?: number | null;
}
