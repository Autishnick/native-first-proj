import {
	addDoc,
	arrayUnion,
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	Timestamp,
	updateDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'
export const useTasks = () => {
	const [tasks, setTasks] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const q = query(collection(db, 'tasks'), orderBy('dueDate', 'asc'))

		const unsubscribe = onSnapshot(
			q,
			snapshot => {
				const tasksData = snapshot.docs.map(doc => {
					const data = doc.data()
					return {
						id: doc.id,
						title: data.title || 'Без назви',
						description: data.description || '',
						category: data.category || 'General',
						payment: data.payment || 0,
						location: data.location || '',
						address: data.address || '',
						status: data.status || 'available',
						createdBy: data.createdBy || null,
						assignedTo: data.assignedTo || null,
						createdAt: data.createdAt || Timestamp.now(),
						dueDate: data.dueDate || Timestamp.now(),
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
	}, [])
	const addBid = async (taskId, bid) => {
		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			bids: arrayUnion({
				workerId: auth.currentUser.uid,
				workerName: bid.workerName,
				bidAmount: bid.bidAmount,
				createdAt: Timestamp.now(),
			}),
		})
	}
	const createTask = async taskData => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) throw new Error('User is not authenticated.')

		await addDoc(collection(db, 'tasks'), {
			...taskData,
			createdBy: currentUserId,
			status: 'available',
			assignedTo: null,
			createdAt: Timestamp.now(),

			dueDate: taskData.dueDate || Timestamp.now(),
		})
	}

	const takeTask = async taskId => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) throw new Error('User is not authenticated.')

		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			status: 'in_progress',
			assignedTo: currentUserId,
		})
	}

	const completeTask = async taskId => {
		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			status: 'completed',
		})
	}

	return { tasks, loading, error, createTask, takeTask, completeTask, addBid }
}
