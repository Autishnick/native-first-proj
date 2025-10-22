import {
	addDoc,
	collection,
	doc,
	onSnapshot,
	query,
	serverTimestamp,
	updateDoc,
	where,
} from 'firebase/firestore'
import { db } from '../src/firebase/config'

// ⭐️ 1. Функція для створення нового сповіщення (при надсиланні ставки)
export const createNotification = async ({
	recipientId,
	senderId,
	senderName,
	taskId,
	type,
	message,
	bidAmount,
}) => {
	try {
		const notificationsRef = collection(db, 'notifications')
		await addDoc(notificationsRef, {
			recipientId,
			senderId,
			senderName,
			taskId,
			type,
			message,
			bidAmount: bidAmount || null,
			read: false,
			createdAt: serverTimestamp(),
		})
		console.log('Notification created successfully')
	} catch (error) {
		console.error('Error creating notification:', error)
		throw error
	}
}

export const subscribeToNotifications = (userId, callback, onError) => {
	if (!userId) return () => {}

	const q = query(
		collection(db, 'notifications'),
		where('recipientId', '==', userId)
	)

	return onSnapshot(
		q,
		snapshot => {
			const list = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			}))
			console.log(
				`✅ NOTIFICATIONS: Found ${list.length} documents for user ${userId}.`
			) // ⭐️ ЛОГ УСПІХУ
			callback(list)
		},
		// ⭐️ ЛОГ ПОМИЛКИ
		error => {
			console.error(
				'❌ FIREBASE SUBSCRIPTION ERROR (check rules/indexes):',
				error.message
			)
			if (onError) onError(error)
		}
	)
}

export const markNotificationAsRead = async notificationId => {
	await updateDoc(doc(db, 'notifications', notificationId), {
		read: true,
	})
}
