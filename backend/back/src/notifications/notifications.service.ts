// Per your request, all code and comments are in English.
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
// Import both interfaces
import { Notification, NotificationData } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  // Use NotificationData (data *without* id) for the collection type
  private readonly notificationsCollection: CollectionReference<NotificationData>;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly firebaseService: FireStoreService) {
    this.notificationsCollection = this.firebaseService.firestore.collection(
      'notifications',
    ) as CollectionReference<NotificationData>;
  }

  /**
   * Finds all notifications for a specific recipient, sorted by creation date.
   * @param recipientId The user ID of the recipient
   */
  async findAllByRecipient(recipientId: string): Promise<Notification[]> {
    const query = this.notificationsCollection
      .where('recipientId', '==', recipientId)
      .orderBy('createdAt', 'desc');

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    // Use the helper to prevent 500 Internal Server Error
    return snapshot.docs.map((doc) => this.docToNotification(doc));
  }

  /**
   * Creates a new notification. Intended to be called by other services.
   * @param dto The data for the new notification
   */
  async create(dto: InternalCreateNotificationDto) {
    // This object matches the NotificationData interface
    const newNotification: NotificationData = {
      ...dto,
      bidAmount: dto.bidAmount || null,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
      recipientName: dto.recipientName || 'Task Owner', // Fallback
    };

    try {
      // This is now type-safe
      const docRef = await this.notificationsCollection.add(newNotification);
      this.logger.log(
        `Notification created: ${docRef.id} for recipient ${dto.recipientId}`,
      );

      // Return a simple object
      return { id: docRef.id, ...dto, read: false };
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Updates a notification (e.g., marks as read).
   * @param id The notification ID
   * @param updateNotificationDto The data to update (e.g., { read: true })
   * @param userId The ID of the user *making the request* (for security)
   */
  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
    userId: string,
  ): Promise<Notification> {
    const docRef = this.notificationsCollection.doc(id);
    const doc = await docRef.get();

    // Check if document exists
    if (!doc.exists) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const data = doc.data() as NotificationData;
    // No need for !data check, doc.exists guarantees it

    // Security check: only recipient can modify the notification
    if (data.recipientId !== userId) {
      this.logger.warn(
        `User ${userId} attempted to update notification ${id} owned by ${data.recipientId}`,
      );
      throw new ForbiddenException(
        'You do not have permission to modify this notification',
      );
    }

    // Update the document
    await docRef.update({
      ...updateNotificationDto,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await docRef.get();
    // Use helper to return the full, updated, and safe object
    return this.docToNotification(updatedDoc);
  }

  /**
   * Converts a Firestore document snapshot to a typed Notification object,
   * handling Timestamp-to-Date conversion.
   */
  private docToNotification(doc: DocumentSnapshot): Notification {
    const data = doc.data() as NotificationData;

    // Create a plain object to safely convert types
    const notification: any = {
      id: doc.id,
      ...data,
    };

    // --- FIX ---
    // Check if createdAt exists and has the .toDate method before calling it
    if (
      notification.createdAt &&
      typeof notification.createdAt.toDate === 'function'
    ) {
      notification.createdAt = notification.createdAt.toDate();
    }

    // Check if updatedAt exists and has the .toDate method
    if (
      notification.updatedAt &&
      typeof notification.updatedAt.toDate === 'function'
    ) {
      notification.updatedAt = notification.updatedAt.toDate();
    }
    // --- END FIX ---

    return notification as Notification;
  }
}
