import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'

import EmployerTaskView from '../../components/modules/EmployerTaskView'
import WorkerTaskView from '../../components/modules/WorkerTaskView'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuthContext'
import { api } from '../../src/api/client'
import { CreateTaskParams, Task } from '../../types/task.types'

interface BidSubmitData {
	taskCreatorId: string
	taskId: string
	[key: string]: any
}

export default function MyTasksScreen() {
	const { user, profile, loading: authLoading } = useAuth()
	const queryClient = useQueryClient()

	const userId = user?.uid

	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)

	const isWorker = profile?.role === 'worker'
	const userName = profile?.displayName

	const {
		data: tasks = [],
		isLoading: tasksLoading,
		error: tasksError,
	} = useQuery<Task[], AxiosError>({
		queryKey: ['tasks', userId],
		queryFn: async () => {
			const { data } = await api.get('/tasks')
			return data
		},
		enabled: !!userId,
	})

	const { mutateAsync: createTaskMutate } = useMutation<
		void,
		AxiosError,
		CreateTaskParams
	>({
		mutationFn: taskData => api.post('/tasks', taskData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			Alert.alert('Success', 'Task created successfully.')
		},
		onError: err => {
			const errorMsg =
				(err.response?.data as any)?.message || 'Failed to create task.'
			Alert.alert('Error', errorMsg)
		},
	})

	const { mutateAsync: deleteTaskMutate } = useMutation<
		void,
		AxiosError,
		string
	>({
		mutationFn: taskId => api.delete(`/tasks/${taskId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			Alert.alert('Deleted', 'Task removed successfully.')
		},
		onError: err => {
			const errorMsg =
				(err.response?.data as any)?.message || 'Failed to delete task.'
			Alert.alert('Error', errorMsg)
		},
	})

	const { mutateAsync: submitBidMutate } = useMutation<
		void,
		AxiosError,
		{ taskId: string; bidData: any }
	>({
		mutationFn: ({ taskId, bidData }) =>
			api.post(`/tasks/${taskId}/bids`, bidData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tasks'] })
			Alert.alert('Success', 'Bid submitted successfully.')
			setModalVisible(false)
		},
		onError: err => {
			const errorMsg =
				(err.response?.data as any)?.message || 'Failed to submit bid.'
			Alert.alert('Error', errorMsg)
		},
	})

	const handleCreateTask = async (taskData: CreateTaskParams) => {
		try {
			await createTaskMutate(taskData)
		} catch (err) {
			console.error('Error creating task:', err)
		}
	}

	const handleDeleteTaskWithAlert = (taskId: string) => {
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
							await deleteTaskMutate(taskId)
						} catch (err) {
							console.error('Error deleting task:', err)
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

	const handleBidSubmission = async (bidData: BidSubmitData) => {
		if (!userId) {
			Alert.alert('Error', 'You must be logged in.')
			return
		}
		if (userId === bidData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot bid on your own task.')
			return
		}

		const { taskCreatorId, taskId, ...bidDetails } = bidData

		if (!taskId) {
			Alert.alert('Error', 'Task ID is missing.')
			return
		}

		try {
			await submitBidMutate({ taskId, bidData: bidDetails })
		} catch (err) {
			console.error('Error submitting bid:', err)
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

	if (tasksError) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>
					Error loading tasks: {tasksError?.message || 'Unknown error'}
				</Text>
			</View>
		)
	}

	if (!userId || !user) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>
					Failed to load user data. Please try logging in again.
				</Text>
			</View>
		)
	}

	return isWorker ? (
		<WorkerTaskView
			userId={userId}
			tasks={tasks}
			handleOpenTaskDetails={handleOpenTaskDetails}
			handleBidSubmission={handleBidSubmission}
		/>
	) : (
		<EmployerTaskView
			userId={userId}
			userName={userName || 'User'}
			tasks={tasks}
			createTask={handleCreateTask}
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
