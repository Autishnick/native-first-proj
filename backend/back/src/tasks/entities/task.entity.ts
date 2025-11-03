import * as admin from 'firebase-admin';
export interface TaskData {
  title: string;
  description: string;
  category: string;
  payment: number;
  dueDate: string | Date | admin.firestore.Timestamp;
  location: string;
  createdAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
  status: 'open' | 'assigned' | 'completed';
  title_lowercase: string;
  bids: any[];
  createdBy: string;
  createdByDisplayName: string;
  updatedAt?: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

export interface Task {
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

  id: string;

  createdAt: Date;
  updatedAt?: Date;
  dueDate: Date;
}
