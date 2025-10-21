import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../src/firebase/config'

export function useTasks() {
	const [tasks, setTasks] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		try {
			const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'))
			const unsubscribe = onSnapshot(
				q,
				snapshot => {
					const tasksData = snapshot.docs.map(doc => {
						const data = doc.data()
						return {
							id: doc.id,
							title: data.title || 'Без назви',
							address: data.address || '',
							createdBy: data.createdBy || 'Невідомо',
							description: data.description || '',
							location: data.location || '',
							payment: data.payment || 0,
							dueDate: data.dueDate || { seconds: Date.now() / 1000 },
						}
					})
					setTasks(tasksData)
					setLoading(false)
				},
				err => {
					console.error('Error fetching tasks:', err)
					setError(err)
					setLoading(false)
				}
			)

			return () => unsubscribe()
		} catch (err) {
			console.error('useTasks hook error:', err)
			setError(err)
			setLoading(false)
		}
	}, [])

	return { tasks, loading, error }
}
