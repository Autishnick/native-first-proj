import {
	addDoc,
	arrayUnion,
	collection,
	deleteDoc,
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
	searchQuery = '',
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

		if (searchQuery && searchQuery.trim() !== '') {
			const trimmedQuery = searchQuery.trim().toLowerCase()
			q = query(
				q,
				where('title_lowercase', '>=', trimmedQuery),
				where('title_lowercase', '<=', trimmedQuery + '\uf8ff')
			)
		}

		let sortField
		switch (sort) {
			case 'price':
				sortField = 'payment'
				break
			case 'alphabet':
				sortField = searchQuery ? 'title_lowercase' : 'title'
				break
			case 'date':
			default:
				sortField = 'createdAt'
		}

		if (!searchQuery || sortField === 'title_lowercase') {
			q = query(q, orderBy(sortField, order))
		} else {
			console.warn(
				'Sorting might be inaccurate when searching and sorting by different fields.'
			)

			q = query(q, orderBy('title_lowercase', order))
		}

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
	}, [category, sort, order, searchQuery])

	const addBid = async (taskId, bid) => {
		if (!taskId) throw new Error('Task ID is required for addBid.')
		const currentUser = auth.currentUser
		if (!currentUser) throw new Error('User must be logged in to add a bid.')

		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			bids: arrayUnion({
				workerId: currentUser.uid,
				workerName: bid.workerName || 'Anonymous Worker',
				bidAmount: bid.bidAmount || 0,
				createdAt: Timestamp.now(),
			}),
		})
	}

	const createTask = async taskData => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) throw new Error('User is not authenticated.')

		const title = taskData.title || ''
		const taskDataWithDefaults = {
			title: title,
			description: taskData.description || '',
			category: taskData.category || 'General',
			payment: taskData.payment || 0,
			location: taskData.location || '',
			address: taskData.address || '',
			title_lowercase: title.toLowerCase(),
			createdBy: currentUserId,
			createdByDisplayName: taskData.createdByDisplayName || 'Employer',
			status: 'available',
			assignedTo: null,
			createdAt: Timestamp.now(),
			dueDate: taskData.dueDate || Timestamp.now(),
			bids: [],
		}

		await addDoc(collection(db, 'tasks'), taskDataWithDefaults)
	}

	const takeTask = async taskId => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId)
			throw new Error('User must be logged in to take a task.')
		if (!taskId) throw new Error('Task ID is required for takeTask.')

		const taskRef = doc(db, 'tasks', taskId)

		await updateDoc(taskRef, {
			status: 'in_progress',
			assignedTo: currentUserId,
		})
	}

	const completeTask = async taskId => {
		if (!taskId) throw new Error('Task ID is required for completeTask.')
		const taskRef = doc(db, 'tasks', taskId)

		await updateDoc(taskRef, {
			status: 'completed',
		})
	}

	const deleteTask = async taskId => {
		if (!taskId) throw new Error('Task ID is required for deleteTask.')

		const taskRef = doc(db, 'tasks', taskId)
		try {
			await deleteDoc(taskRef)
			console.log('Task deleted successfully:', taskId)
		} catch (err) {
			console.error('Error deleting task in hook:', err)
			throw err
		}
	}

	return {
		tasks,
		loading,
		error,
		createTask,
		takeTask,
		completeTask,
		addBid,
		deleteTask,
	}
}
