// Per your request, all code and comments are in English.
import * as admin from 'firebase-admin';

// This is the data structure *inside* the Firestore document
// or when being written by the service
export interface TaskData {
  title: string;
  description: string;
  category: string;
  payment: number;
  dueDate: string | Date | admin.firestore.Timestamp; // String from DTO, Date from service, Timestamp from DB
  location: string;
  createdAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
  status: 'open' | 'assigned' | 'completed';
  title_lowercase: string;
  bids: any[];
  createdBy: string;
  createdByDisplayName: string;
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

/**
 * This is the full Task object *returned by the service* via JSON.
 * Note: It does NOT extend TaskData.
 */
export interface Task {
  // Properties duplicated from TaskData
  title: string;
  description: string;
  category: string;
  payment: number;
  location: string;
  status: 'open' | 'assigned' | 'completed';
  title_lowercase: string;
  bids: any[];
  createdBy: string;
  createdByDisplayName: string;

  // Specific to Task
  id: string;

  // Serialized types (Date objects)
  createdAt: Date;
  updatedAt?: Date;
  dueDate: Date;
}
