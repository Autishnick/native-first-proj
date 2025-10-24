// File: hooks/useChatList.js
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../src/firebase/config'

// Цей хук отримує ВСІ повідомлення, де користувач є відправником АБО отримувачем
export const useChatList = currentUserId => {
	const [messages, setMessages] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!currentUserId) {
			setMessages([])
			setLoading(false)
			return
		}
		setLoading(true)

		// 1. Запит: Всі повідомлення, відправлені користувачем (Вихідні)
		const q1 = query(
			collection(db, 'notifications'),
			where('senderId', '==', currentUserId)
		)

		// 2. Запит: Всі повідомлення, отримані користувачем (Вхідні)
		const q2 = query(
			collection(db, 'notifications'),
			where('recipientId', '==', currentUserId)
		)

		let allMessages = []
		let unsub1Done = false
		let unsub2Done = false

		const mergeResults = () => {
			// Чекаємо, поки обидва запити повернуться
			if (!unsub1Done || !unsub2Done) return

			const finalMessages = allMessages.flat()
			const uniqueMessages = Array.from(
				new Map(finalMessages.map(item => [item.id, item])).values()
			)

			setMessages(uniqueMessages)
			setLoading(false)
		}

		const unsubscribe1 = onSnapshot(q1, snapshot => {
			allMessages[0] = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			}))
			unsub1Done = true
			mergeResults()
		})

		const unsubscribe2 = onSnapshot(q2, snapshot => {
			allMessages[1] = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
			}))
			unsub2Done = true
			mergeResults()
		})

		return () => {
			unsubscribe1()
			unsubscribe2()
		}
	}, [currentUserId])

	return { messages, loading }
}
