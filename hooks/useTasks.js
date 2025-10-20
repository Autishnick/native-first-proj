import {
	addDoc,
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

export const useTasks = () => {
	const [tasks, setTasks] = useState([])
	const [loading, setLoading] = useState(true)

	// Real-time listener for ALL tasks (ordered by creation date)
	useEffect(() => {
		const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))

		const unsubscribe = onSnapshot(
			q,
			snapshot => {
				const tasksData = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))
				setTasks(tasksData)
				setLoading(false)
			},
			error => {
				console.error('Error fetching tasks:', error)
				setLoading(false)
			}
		)

		return () => unsubscribe()
	}, [])

	// Function to create a new task (Only for 'employer')
	const createTask = async taskData => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) return console.error('User not logged in.')

		await addDoc(collection(db, 'tasks'), {
			...taskData, // Includes title, payment, address, dueDate, etc.
			createdBy: currentUserId, // UID of the user who posted the task
			status: 'available',
			assignedTo: null,
			createdAt: new Date(),
		})
	}

	// Function to let a 'worker' take an available task
	const takeTask = async taskId => {
		const currentUserId = auth.currentUser?.uid
		if (!currentUserId) return console.error('User not logged in.')

		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			status: 'in_progress',
			assignedTo: currentUserId,
		})
	}

	// Function to let a 'worker' mark a task as completed
	const completeTask = async taskId => {
		const taskRef = doc(db, 'tasks', taskId)
		await updateDoc(taskRef, {
			status: 'completed',
		})
	}

	return { tasks, loading, createTask, takeTask, completeTask }
}
