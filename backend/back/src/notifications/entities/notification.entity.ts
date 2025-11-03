// Per your request, all code and comments are in English.
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type NotificationType = 'MESSAGE' | 'BID' | 'TASK_UPDATE' | 'NEW_TASK';

/**
 * Interface for the data *as stored in the Firestore document*.
 * (Based on your screenshot and tasks.service.ts)
 * Note: It does NOT include the 'id'.
 */
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

/**
 * Interface for the full Notification object *returned by the service*.
 * Note: It does NOT extend NotificationData because the timestamp types
 * are different (Date vs. Timestamp) for JSON serialization.
 */
export interface Notification {
  id: string; // Document ID
  bidAmount: number | null;
  createdAt: Date; // This is what we return via JSON
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
