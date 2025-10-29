import React, { useState } from 'react'
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

import { CreateTaskParams, Task } from '../../types/task.types'

interface EmployerTaskViewProps {
	userId: string
	userName: string
	tasks: Task[]
	createTask: (taskData: CreateTaskParams) => Promise<void>
	handleOpenTaskDetails: (task: Task) => void
	handleDeleteTask: (taskId: string) => Promise<void> | void
	handleBidSubmission: (bidData: any) => Promise<void> | void
}

interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null
	userId: string
	onSubmitBid: (bidData: any) => Promise<void> | void
}
const CustomModalTS = CustomModal as React.FC<CustomModalProps>

export default function EmployerTaskView({
	userId,
	userName,
	tasks,
	createTask,
	handleOpenTaskDetails,
	handleDeleteTask,
	handleBidSubmission,
}: EmployerTaskViewProps) {
	const [isDetailedModalVisible, setIsDetailedModalVisible] =
		useState<boolean>(false)
	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)

	const openDetailsModal = (task: Task) => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleCreateQuickTask = async (title: string) => {
		const taskData: CreateTaskParams = {
			title: title,
			description: `Quick task: ${title}`,
			category: 'General',
			payment: 50,
		}
		await createTask(taskData)
	}

	const handleCreateDetailedTaskSubmit = async (
		taskDataFromModal: CreateTaskParams
	) => {
		try {
			await createTask(taskDataFromModal)
			setIsDetailedModalVisible(false)
			Alert.alert('Success!', 'Your detailed task has been posted.')
		} catch (error: unknown) {
			console.error('❌ Error creating detailed task:', error)
			const message =
				error instanceof Error
					? error.message
					: 'Failed to create detailed task.'
			Alert.alert('Error', message)
		}
	}

	const myTasks: Task[] = tasks.filter(task => task.createdBy === userId)

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<CustomModalTS
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
