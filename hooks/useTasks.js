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
	where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

export const useTasks = ({
	category = 'all',
	sort = 'date',
	order = 'desc',
} = {}) => {
	const [tasks, setTasks] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		setLoading(true)
		let q = collection(db, 'tasks')

		if (category && category !== 'all') {
			q = query(q, where('category', '==', category))
		}

		let sortField
		switch (sort) {
			case 'price':
				sortField = 'payment'
				break
			case 'alphabet':
				sortField = 'title'
				break
			case 'date':
			default:
				sortField = 'createdAt'
		}

		q = query(q, orderBy(sortField, order))

		const unsubscribe = onSnapshot(
			q,
			snapshot => {
				const tasksData = snapshot.docs.map(doc => {
					const data = doc.data()
					return {
						id: doc.id,
						title: data.title || 'No Title',
						description: data.description || '',
						category: data.category || 'General',
						payment: data.payment || 0,
						status: data.status || 'available',
						createdBy: data.createdBy || null,
						assignedTo: data.assignedTo || null,
						createdAt: data.createdAt || Timestamp.now(),
						dueDate: data.dueDate || Timestamp.now(),
						location: data.location || '',
						address: data.address || '',
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
	}, [category, sort, order])

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

	return {
		tasks,
		loading,
		error,
		createTask,
		takeTask,
		completeTask,
		addBid,
	}
}
