import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type NotificationType = 'MESSAGE' | 'BID' | 'TASK_UPDATE' | 'NEW_TASK';

export interface NotificationData {
  bidAmount: number | null;
  createdAt: FieldValue | Timestamp;
  updatedAt?: FieldValue | Timestamp;
  message: string;
  read: boolean;
  recipientId: string;
  recipientName: string;
  senderId: string;
  senderName: string;
  taskId: string;
  type: NotificationType;
}

export interface Notification {
  id: string;
  bidAmount: number | null;
  createdAt: Date;
  updatedAt?: Date;
  message: string;
  read: boolean;
  recipientId: string;
  recipientName: string;
  senderId: string;
  senderName: string;
  taskId: string;
  type: NotificationType;
}
