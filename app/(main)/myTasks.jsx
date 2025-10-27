import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import EmployerTaskView from '../../components/modules/EmployerTaskView'
import WorkerTaskView from '../../components/modules/WorkerTaskView'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'

export default function MyTasksScreen() {
	const { userId, isWorker, loading: authLoading, userName } = useAuth()
	const {
		tasks,
		loading: tasksLoading,
		error,
		createTask,
		deleteTask,
	} = useTasks({})

	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null) // --- Handlers ---

	const handleDeleteTaskWithAlert = async taskId => {
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
						} catch (err) {
							console.error('Error deleting task:', err)
							Alert.alert('Error', 'Failed to delete the task.')
						}
					},
				},
			]
		)
	}

	const handleOpenTaskDetails = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleBidSubmission = async notificationData => {
		if (!userId) {
			/* ... alert ... */ return
		}
		if (userId === notificationData.taskCreatorId) {
			/* ... alert ... */ return
		}
		try {
			setModalVisible(false)
		} catch (error) {
			/* ... alert ... */
		}
	} // --- Loading and Error States ---

	const isLoading = authLoading || tasksLoading

	if (isLoading) {
		return (
			<View style={styles.centered}>
				        <ActivityIndicator size='large' color={COLORS.accentGreen} />   
				 {' '}
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.centered}>
				       {' '}
				<Text style={styles.errorText}>
					          Error loading tasks: {error.message}       {' '}
				</Text>
				     {' '}
			</View>
		)
	} // --- Render based on Role ---

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
			userName={userName}
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
