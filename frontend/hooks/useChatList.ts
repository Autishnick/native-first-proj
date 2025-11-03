import {
	collection,
	DocumentData,
	onSnapshot,
	query,
	Query,
	QuerySnapshot,
	Timestamp,
	Unsubscribe,
	where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../src/firebase/config'

export interface ChatMessage {
	id: string
	senderId: string
	recipientId: string
	senderName: string
	recipientName?: string
	taskId: string
	type: string
	message: string
	read: boolean
	createdAt: Timestamp
	bidAmount?: number
}

export interface UseChatListReturn {
	messages: ChatMessage[]
	loading: boolean
}

export const useChatList = (
	currentUserId: string | null | undefined
): UseChatListReturn => {
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		if (!currentUserId) {
			setMessages([])
			setLoading(false)
			return
		}
		setLoading(true)

		const q1: Query<DocumentData> = query(
			collection(db, 'notifications'),
			where('senderId', '==', currentUserId)
		)

		const q2: Query<DocumentData> = query(
			collection(db, 'notifications'),
			where('recipientId', '==', currentUserId)
		)

		let allMessages: ChatMessage[][] = [[], []]
		let unsub1Done = false
		let unsub2Done = false

		const mergeResults = () => {
			if (!unsub1Done || !unsub2Done) return

			const finalMessages: ChatMessage[] = [
				...allMessages[0],
				...allMessages[1],
			]

			const uniqueMessagesMap = new Map<string, ChatMessage>()
			finalMessages.forEach(msg => {
				uniqueMessagesMap.set(msg.id, msg)
			})

			const uniqueMessagesArray = Array.from(uniqueMessagesMap.values())

			setMessages(uniqueMessagesArray)
			setLoading(false)
		}

		const unsubscribe1: Unsubscribe = onSnapshot(
			q1,
			(snapshot: QuerySnapshot<DocumentData>) => {
				allMessages[0] = snapshot.docs.map(
					(doc): ChatMessage => ({
						id: doc.id,
						...(doc.data() as Omit<ChatMessage, 'id'>),
					})
				)
				unsub1Done = true
				mergeResults()
			},
			error => {
				console.error('Error fetching sent messages:', error)
				unsub1Done = true
				mergeResults()
			}
		)

		const unsubscribe2: Unsubscribe = onSnapshot(
			q2,
			(snapshot: QuerySnapshot<DocumentData>) => {
				allMessages[1] = snapshot.docs.map(
					(doc): ChatMessage => ({
						id: doc.id,
						...(doc.data() as Omit<ChatMessage, 'id'>),
					})
				)
				unsub2Done = true
				mergeResults()
			},
			error => {
				console.error('Error fetching received messages:', error)
				unsub2Done = true
				mergeResults()
			}
		)

		return () => {
			unsubscribe1()
			unsubscribe2()
		}
	}, [currentUserId])

	return { messages, loading }
}
