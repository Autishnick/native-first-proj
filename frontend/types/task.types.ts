import { Timestamp } from 'firebase/firestore'

export interface Task {
	id: string
	title: string
	description: string
	category: string
	payment: number
	status: TaskStatus
	createdBy: string
	createdByDisplayName: string
	assignedTo?: string | null
	createdAt: string
	dueDate: string
	location?: string
	address?: string
	[key: string]: any
}

export type TaskStatus = 'available' | 'in_progress' | 'completed' | 'assigned'

export interface CreateTaskParams {
	title: string
	description?: string
	category?: string
	payment?: number
	location?: string
	address?: string
	dueDate?: Timestamp
	[key: string]: any
}

export interface BidNotificationData {
	senderId: string
	senderName: string
	bidAmount: number
	message: string
	recipientId: string
	taskId: string
	type: 'BID'
	createdAt?: Timestamp | string
}

export interface Bidder extends BidNotificationData {
	id: string
	proposalMessage: string
	createdAt: Timestamp | string
}
