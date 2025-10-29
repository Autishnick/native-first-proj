import {
	addDoc,
	arrayUnion,
	collection,
	CollectionReference,
	deleteDoc,
	doc,
	DocumentData,
	FirestoreError,
	onSnapshot,
	orderBy,
	query,
	Query,
	Timestamp,
	updateDoc,
	where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

type TaskStatus = 'available' | 'in_progress' | 'completed'
type SortField = 'date' | 'price' | 'alphabet'
type SortOrder = 'asc' | 'desc'

interface Bid {
	workerId: string
	workerName: string
	bidAmount: number
	createdAt: Timestamp
}

interface TaskData {
	title: string
	description: string
	category: string
	payment: number
	location: string
	address: string
	title_lowercase: string
	createdBy: string
	createdByDisplayName: string
	status: TaskStatus
	assignedTo: string | null
	createdAt: Timestamp
	dueDate: Timestamp
	bids: Bid[]
}

export interface Task {
	id: string
	title: string
	description: string
	category: string
	payment: number
	status: TaskStatus
	createdBy: string | null
	assignedTo: string | null
	createdAt: Timestamp
	dueDate: Timestamp
	location: string
	address: string
}

interface UseTasksParams {
	category?: string
	sort?: SortField
	order?: SortOrder
	searchQuery?: string
}

interface AddBidParams {
	workerName?: string
	bidAmount?: number
}

interface CreateTaskParams {
	title?: string
	description?: string
	category?: string
	payment?: number
	location?: string
	address?: string
	createdByDisplayName?: string
	dueDate?: Timestamp
}

export const useTasks = ({
	category = 'all',
	sort = 'date',
	order = 'desc',
	searchQuery = '',
}: UseTasksParams = {}) => {
	const [tasks, setTasks] = useState<Task[]>([])
	const [loading, setLoading] = useState<boolean>(true)
	const [error, setError] = useState<FirestoreError | null>(null)

	useEffect(() => {
		setLoading(true)
		let q: Query<DocumentData> | CollectionReference<DocumentData> = collection(
			db,
			'tasks'
		)

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

		let sortField: 'payment' | 'title_lowercase' | 'title' | 'createdAt'
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
				const tasksData: Task[] = snapshot.docs.map((doc): Task => {
					const data = doc.data()
					return {
						id: doc.id,
						title: data.title || 'No Title',
						description: data.description || '',
						category: data.category || 'General',
						payment: data.payment || 0,
						status: (data.status as TaskStatus) || 'available',
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
				setError(err as FirestoreError)
				setLoading(false)
			}
		)

		return () => unsubscribe()
	}, [category, sort, order, searchQuery])

	const addBid = async (taskId: string, bid: AddBidParams): Promise<void> => {
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

	const createTask = async (taskData: CreateTaskParams): Promise<void> => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) throw new Error('User is not authenticated.')

		const title = taskData.title || ''
		const taskDataWithDefaults: TaskData = {
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

	const takeTask = async (taskId: string): Promise<void> => {
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

	const completeTask = async (taskId: string): Promise<void> => {
		if (!taskId) throw new Error('Task ID is required for completeTask.')
		const taskRef = doc(db, 'tasks', taskId)

		await updateDoc(taskRef, {
			status: 'completed',
		})
	}

	const deleteTask = async (taskId: string): Promise<void> => {
		if (!taskId) throw new Error('Task ID is required for deleteTask.')

		const taskRef = doc(db, 'tasks', taskId)
		try {
			await deleteDoc(taskRef)
			console.log('Task deleted successfully:', taskId)
		} catch (err: unknown) {
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
