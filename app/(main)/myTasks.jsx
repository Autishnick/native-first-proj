// File: app/(main)/myTasks.jsx
import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native'
import EmployerTaskView from '../../components/modules/EmployerTaskView' // Import Employer view
import WorkerTaskView from '../../components/modules/WorkerTaskView' // Import Worker view
import { COLORS } from '../../constants/colors' // Import COLORS
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks' // Import useTasks hook

export default function MyTasksScreen() {
	const { userId, isWorker, loading: authLoading, userName } = useAuth()
	// We fetch ALL tasks here, filtering happens inside child components
	const {
		tasks,
		loading: tasksLoading,
		error,
		createTask,
		deleteTask,
	} = useTasks({}) // Fetch all tasks, get deleteTask

	// State for ModalTaskDetails (needed by both views, kept here)
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	// --- Handlers ---

	// Delete handler now uses the hook function
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
							await deleteTask(taskId) // Call function from hook
							Alert.alert('Deleted', 'Task removed successfully.')
							// No need to manually update state, onSnapshot handles it
						} catch (err) {
							console.error('Error deleting task:', err)
							Alert.alert('Error', 'Failed to delete the task.')
						}
					},
				},
			]
		)
	}

	// Handler for opening the details modal (passed to both views)
	const handleOpenTaskDetails = task => {
		// Optional: Add the check for worker again here if needed,
		// or rely on the check within WorkerTaskView / EmployerTaskView if preferred.
		// if (isWorker && task.assignedTo && task.assignedTo !== userId) {
		//   Alert.alert('Task Unavailable', 'This task is already assigned to someone else.');
		//   return;
		// }
		setSelectedTask(task)
		setModalVisible(true)
	}

	// Bid submission handler (passed to both views, primarily used by Worker)
	// NOTE: This might need adjustment based on where bids are submitted from.
	// If only Worker view uses it, pass it only there.
	const handleBidSubmission = async notificationData => {
		if (!userId) {
			/* ... alert ... */ return
		}
		if (userId === notificationData.taskCreatorId) {
			/* ... alert ... */ return
		}
		try {
			// ... (createNotification logic)
			setModalVisible(false)
		} catch (error) {
			/* ... alert ... */
		}
	}

	// --- Loading and Error States ---
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
					Error loading tasks: {error.message}
				</Text>
			</View>
		)
	}

	// --- Render based on Role ---
	return isWorker ? (
		<WorkerTaskView
			userId={userId}
			tasks={tasks} // Pass all tasks
			handleOpenTaskDetails={handleOpenTaskDetails}
			handleBidSubmission={handleBidSubmission} // Pass if needed
		/>
	) : (
		<EmployerTaskView
			userId={userId}
			userName={userName}
			tasks={tasks} // Pass all tasks (filtering happens inside)
			createTask={createTask} // Pass createTask from hook
			handleOpenTaskDetails={handleOpenTaskDetails}
			handleDeleteTask={handleDeleteTaskWithAlert} // Pass delete handler
			handleBidSubmission={handleBidSubmission} // Pass if needed for viewing bids?
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
