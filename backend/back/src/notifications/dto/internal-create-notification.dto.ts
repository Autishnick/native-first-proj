// Per your request, all code and comments are in English.
import { NotificationType } from '../entities/notification.entity';

/**
 * This DTO is used for service-to-service communication
 * (e.g., from TasksService to NotificationsService)
 */
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
