import {
	addDoc,
	collection,
	doc,
	DocumentData,
	FirestoreError,
	onSnapshot,
	query,
	QuerySnapshot,
	serverTimestamp,
	Timestamp,
	Unsubscribe,
	updateDoc,
	where,
} from 'firebase/firestore'
import { db } from '../src/firebase/config'

export interface CreateNotificationParams {
	recipientId: string
	senderId: string
	senderName: string
	recipientName: string
	taskId: string
	type: string
	message: string
	bidAmount?: number
}

interface NotificationDocumentData {
	recipientId: string
	senderId: string
	senderName: string
	recipientName: string
	taskId: string
	type: string
	message: string
	bidAmount: number | null
	read: boolean
	createdAt: Timestamp
}

export interface Notification extends NotificationDocumentData {
	id: string
}

export const createNotification = async ({
	recipientId,
	senderId,
	senderName,
	recipientName,
	taskId,
	type,
	message,
	bidAmount,
}: CreateNotificationParams): Promise<void> => {
	try {
		const notificationsRef = collection(db, 'notifications')
		await addDoc(notificationsRef, {
			recipientId,
			senderId,
			senderName,
			recipientName,
			taskId,
			type,
			message,
			bidAmount: bidAmount ?? null,
			read: false,
			createdAt: serverTimestamp(),
		})
		console.log(
			'Notification created successfully with recipientName:',
			recipientName
		)
	} catch (error) {
		console.error('Error creating notification:', error)
		throw error
	}
}

export const subscribeToNotifications = (
	userId: string | null | undefined,
	callback: (notifications: Notification[]) => void,
	onError?: (error: FirestoreError) => void
): Unsubscribe => {
	if (!userId) {
		console.warn('subscribeToNotifications called without userId.')
		return () => {}
	}

	const q = query(
		collection(db, 'notifications'),
		where('recipientId', '==', userId)
	)

	const unsubscribe = onSnapshot(
		q,
		(snapshot: QuerySnapshot<DocumentData>) => {
			const list: Notification[] = snapshot.docs.map(doc => {
				const data = doc.data() as NotificationDocumentData
				return {
					id: doc.id,
					...data,
					createdAt: data.createdAt || Timestamp.now(),
				}
			})
			console.log(
				`✅ NOTIFICATIONS: Found ${list.length} documents for user ${userId}.`
			)

			const sortedList = list.sort((a, b) => {
				const timeA = a.createdAt?.toDate?.()?.getTime() ?? 0
				const timeB = b.createdAt?.toDate?.()?.getTime() ?? 0
				return timeB - timeA
			})

			callback(sortedList)
		},
		(error: FirestoreError) => {
			console.error(
				'❌ FIREBASE NOTIFICATION SUBSCRIPTION ERROR (check rules/indexes):',
				error.message,
				error.code
			)
			if (onError) {
				onError(error)
			}
		}
	)

	return unsubscribe
}

export const markNotificationAsRead = async (
	notificationId: string
): Promise<void> => {
	if (!notificationId) {
		console.error('markNotificationAsRead called without notificationId.')
		return
	}
	try {
		const notificationRef = doc(db, 'notifications', notificationId)
		await updateDoc(notificationRef, {
			read: true,
		})
	} catch (error) {
		console.error(
			`Error marking notification ${notificationId} as read:`,
			error
		)
	}
}
