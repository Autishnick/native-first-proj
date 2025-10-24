// File: components/modules/EmployerTaskView.jsx
import { useState } from 'react'
import {
	Alert,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import CreateTaskModal from './CreateDetailTaskModal' // Assuming path
import CustomModal from './ModalTaskDetails' // Assuming path
import MyCreatedTasksList from './MyCreatedTasksList'
import QuickTaskForm from './QuickTaskForm'

export default function EmployerTaskView({
	userId,
	userName,
	tasks, // Full list from useTasks
	createTask,
	handleOpenTaskDetails,
	handleDeleteTask, // Function passed from MyTasksScreen
	handleBidSubmission, // Function passed from MyTasksScreen
}) {
	const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false)
	const [modalVisible, setModalVisible] = useState(false) // ModalTaskDetails visibility
	const [selectedTask, setSelectedTask] = useState(null) // Selected task for ModalTaskDetails

	// Wrapper for handleOpenTaskDetails to manage local state
	const openDetailsModal = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	// Wrapper for creating quick tasks
	const handleCreateQuickTask = async title => {
		const taskData = {
			title: title,
			description: `Quick task: ${title}`,
			category: 'General', // Default values
			payment: 50, // Default value
			// Note: createdBy, createdByDisplayName, title_lowercase are added within createTask hook now
		}
		await createTask(taskData) // Call the function from useTasks hook
	}

	// Wrapper for creating detailed tasks
	const handleCreateDetailedTaskSubmit = async taskDataFromModal => {
		try {
			await createTask(taskDataFromModal) // Call the function from useTasks hook
			setIsDetailedModalVisible(false) // Close modal on success
			Alert.alert('Success!', 'Your detailed task has been posted.')
		} catch (error) {
			console.error('❌ Error creating detailed task:', error)
			Alert.alert('Error', 'Failed to create detailed task.')
			// Keep modal open on error maybe?
		}
	}

	// Filter tasks created by the current employer
	const myTasks = tasks.filter(task => task.createdBy === userId)

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<CustomModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				task={selectedTask} // Pass the single selected task
				userId={userId}
				onSubmitBid={handleBidSubmission} // Pass down the bid submission handler
			/>
			<Text style={styles.headerText}>Need help? Get it done!</Text>

			<QuickTaskForm onSubmit={handleCreateQuickTask} />

			<TouchableOpacity
				style={styles.detailedButton}
				onPress={() => setIsDetailedModalVisible(true)}
			>
				<Text style={styles.detailedButtonText}>Create New Detailed Task</Text>
			</TouchableOpacity>

			<CreateTaskModal
				visible={isDetailedModalVisible}
				onClose={() => setIsDetailedModalVisible(false)}
				onSubmit={handleCreateDetailedTaskSubmit}
			/>

			<MyCreatedTasksList
				tasks={myTasks}
				onTaskPress={openDetailsModal} // Use the wrapper
				onDeleteTask={handleDeleteTask} // Pass the delete handler down
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 50,
		backgroundColor: COLORS.background,
	},
	headerText: {
		fontSize: 26,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		textAlign: 'center',
		marginBottom: 24,
	},
	detailedButton: {
		backgroundColor: COLORS.border, // Or another suitable color
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		width: '100%',
		marginBottom: 20, // Add margin
	},
	detailedButtonText: {
		color: COLORS.textPrimary, // Use light text for dark button
		fontSize: 16,
		fontWeight: 'bold',
	},
})
