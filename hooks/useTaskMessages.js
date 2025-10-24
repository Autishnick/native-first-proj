// File: hooks/useTaskMessages.js
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	where,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { db } from '../src/firebase/config'

export const useTaskMessages = (currentUserId, taskId) => {
	const [sentMessages, setSentMessages] = useState([])
	const [receivedMessages, setReceivedMessages] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!currentUserId || !taskId) {
			setSentMessages([]) // Очищуємо стан при виході
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

		// Слухач для ВІДПРАВЛЕНИХ
		const q1 = query(
			collection(db, 'notifications'),
			where('taskId', '==', taskId),
			where('senderId', '==', currentUserId),
			orderBy('createdAt', 'asc')
		)

		const unsubscribe1 = onSnapshot(
			q1,
			snapshot => {
				const messages = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
					// Конвертуємо Timestamp тут для стабільності
					createdAt: doc.data().createdAt?.toDate(),
				}))
				setSentMessages(messages)
				if (!sentLoaded) {
					sentLoaded = true
					checkLoading()
				}
			},
			error => {
				console.error('Error fetching sent messages:', error)
				sentLoaded = true // Позначаємо як завантажене, щоб не блокувати вічно
				checkLoading()
			}
		)

		// Слухач для ОТРИМАНИХ
		const q2 = query(
			collection(db, 'notifications'),
			where('taskId', '==', taskId),
			where('recipientId', '==', currentUserId),
			orderBy('createdAt', 'asc')
		)

		const unsubscribe2 = onSnapshot(
			q2,
			snapshot => {
				const messages = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
					// Конвертуємо Timestamp тут для стабільності
					createdAt: doc.data().createdAt?.toDate(),
				}))
				setReceivedMessages(messages)
				if (!receivedLoaded) {
					receivedLoaded = true
					checkLoading()
				}
			},
			error => {
				console.error('Error fetching received messages:', error)
				receivedLoaded = true // Позначаємо як завантажене
				checkLoading()
			}
		)

		return () => {
			unsubscribe1()
			unsubscribe2()
		}
	}, [currentUserId, taskId])

	// Об'єднуємо та сортуємо масиви
	const messages = useMemo(() => {
		const allMessages = [...sentMessages, ...receivedMessages]

		allMessages.sort((a, b) => {
			const dateA = a.createdAt?.getTime() || 0 // Вже маємо Date об'єкт
			const dateB = b.createdAt?.getTime() || 0
			return dateA - dateB // Сортування asc (старіші перші)
		})

		// Видаляємо дублікати про всяк випадок
		return Array.from(
			new Map(allMessages.map(item => [item.id, item])).values()
		)
	}, [sentMessages, receivedMessages]) // Перерахунок при зміні будь-якого масиву

	return { messages, loading }
}
