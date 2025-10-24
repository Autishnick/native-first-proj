// File: hooks/useTasks.js
import {
	addDoc,
	arrayUnion,
	collection,
	deleteDoc, // Import deleteDoc
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

		// Category Filter (Backend)
		if (category && category !== 'all') {
			q = query(q, where('category', '==', category))
		}

		// Prefix Search (Backend)
		if (searchQuery && searchQuery.trim() !== '') {
			const trimmedQuery = searchQuery.trim().toLowerCase()
			q = query(
				q,
				where('title_lowercase', '>=', trimmedQuery),
				where('title_lowercase', '<=', trimmedQuery + '\uf8ff')
			)
			// IMPORTANT: Ensure you have a 'title_lowercase' field in Firestore.
		}

		// Sorting (Backend)
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

		// Add sorting ONLY if it doesn't conflict with search range filter
		if (!searchQuery || sortField === 'title_lowercase') {
			q = query(q, orderBy(sortField, order))
		} else {
			console.warn(
				'Sorting might be inaccurate when searching and sorting by different fields.'
			)
			// Default sort by title_lowercase when search is active & sort field differs
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
						createdAt: data.createdAt || Timestamp.now(), // Handle potential missing fields
						dueDate: data.dueDate || Timestamp.now(), // Handle potential missing fields
						location: data.location || '',
						address: data.address || '',
						// Ensure title_lowercase exists if needed elsewhere, though query uses db field
						// title_lowercase: data.title_lowercase || (data.title || '').toLowerCase()
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
	}, [category, sort, order, searchQuery]) // Add searchQuery dependency

	// Add a bid to a task
	const addBid = async (taskId, bid) => {
		if (!taskId) throw new Error('Task ID is required for addBid.')
		const currentUser = auth.currentUser
		if (!currentUser) throw new Error('User must be logged in to add a bid.')

		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			bids: arrayUnion({
				workerId: currentUser.uid,
				workerName: bid.workerName || 'Anonymous Worker', // Provide default
				bidAmount: bid.bidAmount || 0, // Provide default
				createdAt: Timestamp.now(),
			}),
		})
	}

	// Create a new task
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
			title_lowercase: title.toLowerCase(), // Ensure lowercase title exists
			createdBy: currentUserId,
			createdByDisplayName: taskData.createdByDisplayName || 'Employer', // Add if needed
			status: 'available',
			assignedTo: null,
			createdAt: Timestamp.now(),
			dueDate: taskData.dueDate || Timestamp.now(), // Use provided or default
			bids: [], // Initialize bids array
		}

		await addDoc(collection(db, 'tasks'), taskDataWithDefaults)
	}

	// Assign a task to the current worker
	const takeTask = async taskId => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId)
			throw new Error('User must be logged in to take a task.')
		if (!taskId) throw new Error('Task ID is required for takeTask.')

		const taskRef = doc(db, 'tasks', taskId)
		// Consider adding checks here (e.g., if task is already assigned)
		await updateDoc(taskRef, {
			status: 'in_progress',
			assignedTo: currentUserId,
		})
	}

	// Mark a task as completed
	const completeTask = async taskId => {
		if (!taskId) throw new Error('Task ID is required for completeTask.')
		const taskRef = doc(db, 'tasks', taskId)
		// Consider adding checks here (e.g., only assigned user can complete)
		await updateDoc(taskRef, {
			status: 'completed',
		})
	}

	// Delete a task
	const deleteTask = async taskId => {
		if (!taskId) throw new Error('Task ID is required for deleteTask.')
		// Optional: Add check if the current user is the owner before deleting
		const taskRef = doc(db, 'tasks', taskId)
		try {
			await deleteDoc(taskRef)
			console.log('Task deleted successfully:', taskId)
		} catch (err) {
			console.error('Error deleting task in hook:', err)
			throw err // Re-throw error for component to handle
		}
	}

	// Return state and action functions
	return {
		tasks,
		loading,
		error,
		createTask,
		takeTask,
		completeTask,
		addBid,
		deleteTask, // Include deleteTask in the returned object
	}
}
