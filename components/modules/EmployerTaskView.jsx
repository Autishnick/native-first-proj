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
import CreateTaskModal from './CreateDetailTaskModal'
import CustomModal from './ModalTaskDetails'
import MyCreatedTasksList from './MyCreatedTasksList'
import QuickTaskForm from './QuickTaskForm'

export default function EmployerTaskView({
	userId,
	userName,
	tasks,
	createTask,
	handleOpenTaskDetails,
	handleDeleteTask,
	handleBidSubmission,
}) {
	const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false)
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	const openDetailsModal = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleCreateQuickTask = async title => {
		const taskData = {
			title: title,
			description: `Quick task: ${title}`,
			category: 'General',
			payment: 50,
		}
		await createTask(taskData)
	}

	const handleCreateDetailedTaskSubmit = async taskDataFromModal => {
		try {
			await createTask(taskDataFromModal)
			setIsDetailedModalVisible(false)
			Alert.alert('Success!', 'Your detailed task has been posted.')
		} catch (error) {
			console.error('❌ Error creating detailed task:', error)
			Alert.alert('Error', 'Failed to create detailed task.')
		}
	}

	const myTasks = tasks.filter(task => task.createdBy === userId)

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<CustomModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				task={selectedTask}
				userId={userId}
				onSubmitBid={handleBidSubmission}
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
				onTaskPress={openDetailsModal}
				onDeleteTask={handleDeleteTask}
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
		backgroundColor: COLORS.border,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	detailedButtonText: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: 'bold',
	},
})
