import {
	collection,
	DocumentData,
	FirestoreError,
	onSnapshot,
	orderBy,
	query,
	QuerySnapshot,
	Timestamp,
	where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../src/firebase/config'

interface NotificationData {
	createdAt: Timestamp
	[key: string]: any
}

export interface TaskMessage {
	id: string
	createdAt?: Date
	[key: string]: any
}

export const useTaskMessages = (
	currentUserId: string | null | undefined,
	taskId: string | null | undefined
): { messages: TaskMessage[]; loading: boolean } => {
	const [sentMessages, setSentMessages] = useState<TaskMessage[]>([])
	const [receivedMessages, setReceivedMessages] = useState<TaskMessage[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		if (!currentUserId || !taskId) {
			setSentMessages([])
			setReceivedMessages([])
			setLoading(false)
			return
		}
		setLoading(true)

		let sentLoaded = false
		let receivedLoaded = false

		const checkLoading = () => {
			if (sentLoaded && receivedLoaded) {
				setLoading(false)
			}
		}

		const q1 = query(
			collection(db, 'notifications'),
			where('taskId', '==', taskId),
			where('senderId', '==', currentUserId),
			orderBy('createdAt', 'asc')
		)

		const unsubscribe1 = onSnapshot(
			q1,
			(snapshot: QuerySnapshot<DocumentData>) => {
				const messages: TaskMessage[] = snapshot.docs.map(doc => {
					const data = doc.data() as NotificationData
					return {
						id: doc.id,
						...data,
						createdAt: data.createdAt?.toDate(),
					}
				})
				setSentMessages(messages)
				if (!sentLoaded) {
					sentLoaded = true
					checkLoading()
				}
			},
			(error: FirestoreError) => {
				console.error('Error fetching sent messages:', error)
				sentLoaded = true
				checkLoading()
			}
		)

		const q2 = query(
			collection(db, 'notifications'),
			where('taskId', '==', taskId),
			where('recipientId', '==', currentUserId),
			orderBy('createdAt', 'asc')
		)

		const unsubscribe2 = onSnapshot(
			q2,
			(snapshot: QuerySnapshot<DocumentData>) => {
				const messages: TaskMessage[] = snapshot.docs.map(doc => {
					const data = doc.data() as NotificationData
					return {
						id: doc.id,
						...data,
						createdAt: data.createdAt?.toDate(),
					}
				})
				setReceivedMessages(messages)
				if (!receivedLoaded) {
					receivedLoaded = true
					checkLoading()
				}
			},
			(error: FirestoreError) => {
				console.error('Error fetching received messages:', error)
				receivedLoaded = true
				checkLoading()
			}
		)

		return () => {
			unsubscribe1()
			unsubscribe2()
		}
	}, [currentUserId, taskId])

	const messages: TaskMessage[] = useMemo(() => {
		const allMessages: TaskMessage[] = [...sentMessages, ...receivedMessages]

		allMessages.sort((a: TaskMessage, b: TaskMessage) => {
			const dateA = a.createdAt?.getTime() || 0
			const dateB = b.createdAt?.getTime() || 0
			return dateA - dateB
		})

		return Array.from(
			new Map(allMessages.map(item => [item.id, item])).values()
		)
	}, [sentMessages, receivedMessages])

	return { messages, loading }
}
