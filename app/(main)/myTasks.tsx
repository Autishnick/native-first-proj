import { FirestoreError } from 'firebase/firestore'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import EmployerTaskView from '../../components/modules/EmployerTaskView'
import WorkerTaskView from '../../components/modules/WorkerTaskView'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'

import { CreateTaskParams, Task } from '../../types/task.types'

interface Profile {
	displayName: string
	role: string
}

interface AuthHookValue {
	userId: string | null | undefined
	profile: Profile | null | undefined
	loading: boolean
}

interface TasksHookValue {
	tasks: Task[]
	loading: boolean
	error: FirestoreError | null
	createTask: (taskData: CreateTaskParams) => Promise<void>
	deleteTask: (taskId: string) => Promise<void>
}

interface BidNotificationData {
	taskCreatorId: string
	[key: string]: any
}

export default function MyTasksScreen() {
	const { userId, profile, loading: authLoading } = useAuth() as AuthHookValue

	const {
		tasks,
		loading: tasksLoading,
		error,
		createTask,
		deleteTask,
	} = useTasks({}) as TasksHookValue

	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)

	const isWorker = profile?.role === 'worker'
	const userName = profile?.displayName

	const handleDeleteTaskWithAlert = async (taskId: string) => {
		Alert.alert(
			'Confirm Delete',
			'Are you sure you want to delete this task?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await deleteTask(taskId)
							Alert.alert('Deleted', 'Task removed successfully.')
						} catch (err: unknown) {
							console.error('Error deleting task:', err)
							Alert.alert('Error', 'Failed to delete the task.')
						}
					},
				},
			]
		)
	}

	const handleOpenTaskDetails = (task: Task) => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleBidSubmission = async (notificationData: BidNotificationData) => {
		if (!userId) {
			Alert.alert('Error', 'You must be logged in.')
			return
		}
		if (userId === notificationData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot perform this action on your own task.')
			return
		}
		try {
			setModalVisible(false)
		} catch (error: unknown) {
			if (error instanceof Error) {
				Alert.alert('Error', error.message)
			} else {
				Alert.alert('Error', 'An unexpected error occurred.')
			}
		}
	}

	const isLoading = authLoading || tasksLoading

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>
					Error loading tasks: {error?.message || 'Unknown error'}
				</Text>
			</View>
		)
	}

	return isWorker ? (
		<WorkerTaskView
			userId={userId as string}
			tasks={tasks}
			handleOpenTaskDetails={handleOpenTaskDetails}
			handleBidSubmission={handleBidSubmission}
		/>
	) : (
		<EmployerTaskView
			userId={userId as string}
			userName={userName || 'User'}
			tasks={tasks}
			createTask={createTask}
			handleOpenTaskDetails={handleOpenTaskDetails}
			handleDeleteTask={handleDeleteTaskWithAlert}
			handleBidSubmission={handleBidSubmission}
		/>
	)
}

const styles = StyleSheet.create({
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	errorText: {
		color: COLORS.accentRed,
		fontSize: 16,
		textAlign: 'center',
	},
})
