import { deleteDoc, doc } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import CreateTaskModal from '../../components/modules/CreateDetailTaskModal'
import CustomModal from '../../components/modules/ModalTaskDetails'
import TaskItem from '../../components/ui/TaskItem'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { db } from '../../src/firebase/config'
import { createNotification } from '../../utils/firebaseUtils'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	accentRed: '#F56565',
	buttonTextDark: '#1A202C',
	border: '#4A5568',
}

const handleDeleteTask = async taskId => {
	Alert.alert('Confirm Delete', 'Are you sure you want to delete this task?', [
		{ text: 'Cancel', style: 'cancel' },
		{
			text: 'Delete',
			style: 'destructive',
			onPress: async () => {
				try {
					await deleteDoc(doc(db, 'tasks', taskId))
					Alert.alert('Deleted', 'Task removed successfully.')
				} catch (err) {
					console.error('Error deleting task:', err)
					Alert.alert('Error', 'Failed to delete the task.')
				}
			},
		},
	])
}

export default function MyTasksScreen() {
	const [activeTab, setActiveTab] = useState('available')
	const [text, setText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false)

	const { userId, isWorker, loading: authLoading, userName } = useAuth()
	const { tasks, loading: tasksLoading, error, createTask } = useTasks()
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	const handleOpenTaskDetails = task => {
		if (isWorker && task.assignedTo && task.assignedTo !== userId) {
			Alert.alert(
				'Task Unavailable',
				'This task is already assigned to someone else.'
			)
			return
		}
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleBidSubmission = async notificationData => {
		if (!userId) {
			Alert.alert('Error', 'You must be logged in to place a bid.')
			return
		}
		if (userId === notificationData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot place a bid on your own task.')
			return
		}
		try {
			const dataToSend = {
				...notificationData,
				senderId: userId,
				senderName: userName || 'Anonymous User',
			}
			await createNotification(dataToSend)
			Alert.alert('Success', 'Bid submitted and creator notified successfully!')
			setModalVisible(false)
		} catch (error) {
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
			console.error('Bid submission failed:', error)
		}
	}

	const handleCreateTask = async () => {
		if (!text.trim()) {
			Alert.alert('Error', 'Please describe what you need done.')
			return
		}
		if (!userId) {
			Alert.alert('Error', 'Authentication error. Please restart the app.')
			return
		}

		setIsSubmitting(true)
		try {
			const taskData = {
				title: text,
				description: `Quick task: ${text}`,
				createdBy: userId,
				createdByDisplayName: userName || 'Employer',
				category: 'General',
				payment: 50,
			}
			console.log('🔍 Creating quick task:', taskData)
			console.log('👤 Current user ID:', userId)

			await createTask(taskData)
			Alert.alert('Success!', 'Your task has been posted.')
			setText('')
		} catch (error) {
			console.error('❌ Error creating task:', error)
			console.error('❌ Error code:', error.code)
			console.error('❌ Error message:', error.message)
			Alert.alert('Error', 'Failed to create task.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCreateDetailedTask = async taskDataFromModal => {
		if (!userId) {
			Alert.alert('Error', 'Authentication error. Please restart the app.')
			throw new Error('User not authenticated.')
		}

		try {
			const completeTaskData = {
				...taskDataFromModal,
				createdBy: userId,
				createdByDisplayName: userName || 'Employer',
			}

			console.log('🔍 Creating detailed task:', completeTaskData)
			console.log('👤 Current user ID:', userId)

			await createTask(completeTaskData)

			Alert.alert('Success!', 'Your detailed task has been posted.')
			setIsDetailedModalVisible(false)
		} catch (error) {
			console.error('❌ Error creating detailed task:', error)
			console.error('❌ Error code:', error.code)
			console.error('❌ Error message:', error.message)
			throw error
		}
	}

	const filteredTasks = useMemo(() => {
		if (activeTab === 'taken') {
			return tasks.filter(task => task.assignedTo === userId)
		}
		return tasks.filter(task => !task.assignedTo)
	}, [activeTab, tasks, userId])

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

	if (!isWorker) {
		return (
			<View style={styles.centered}>
				<StatusBar barStyle='light-content' />
				<CustomModal
					visible={modalVisible}
					onClose={() => setModalVisible(false)}
					title={selectedTask ? selectedTask.title : 'Task details'}
					tasks={selectedTask ? [selectedTask] : []}
					onSubmitBid={handleBidSubmission}
				/>
				<Text style={styles.headerText}>Need help? Get it done!</Text>

				<View style={styles.quickTaskForm}>
					<TextInput
						style={styles.input}
						placeholder='What do you need done?'
						placeholderTextColor={COLORS.textSecondary}
						onChangeText={newText => setText(newText)}
						value={text}
						editable={!isSubmitting}
						color={COLORS.textPrimary}
					/>
					<TouchableOpacity
						style={[
							styles.quickButton,
							isSubmitting && styles.quickButtonDisabled,
						]}
						onPress={handleCreateTask}
						disabled={isSubmitting}
					>
						<Text style={styles.quickButtonText}>
							{isSubmitting ? 'Posting...' : 'Post Task'}
						</Text>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={[styles.quickButton, styles.detailedButton]}
					onPress={() => setIsDetailedModalVisible(true)}
				>
					<Text style={styles.quickButtonText}>Create New Detailed Task</Text>
				</TouchableOpacity>

				<CreateTaskModal
					visible={isDetailedModalVisible}
					onClose={() => setIsDetailedModalVisible(false)}
					onSubmit={handleCreateDetailedTask}
				/>

				<FlatList
					style={{ width: '100%', marginTop: 30 }}
					data={tasks.filter(task => task.createdBy === userId)}
					keyExtractor={item => item.id}
					ListHeaderComponent={
						<Text style={styles.myTasksHeader}>
							My Tasks ({tasks.filter(task => task.createdBy === userId).length}
							)
						</Text>
					}
					renderItem={({ item }) => (
						<View style={styles.myTaskWrapper}>
							<TaskItem
								task={item}
								onPress={() => handleOpenTaskDetails(item)}
							/>

							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => handleDeleteTask(item.id)}
							>
								<Text style={styles.deleteButtonText}>Delete</Text>
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={
						<Text style={styles.noTasksText}>
							You haven't created any tasks yet.
						</Text>
					}
					contentContainerStyle={{ paddingBottom: 20 }}
				/>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<CustomModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				title={selectedTask ? selectedTask.title : 'Task details'}
				tasks={selectedTask ? [selectedTask] : []}
				onSubmitBid={handleBidSubmission}
			/>
			<View style={styles.tabSelector}>
				<TouchableOpacity
					style={[styles.tabButton, activeTab === 'taken' && styles.activeTab]}
					onPress={() => setActiveTab('taken')}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'taken' && styles.activeTabText,
						]}
					>
						My Jobs
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.tabButton,
						activeTab === 'available' && styles.activeTab,
					]}
					onPress={() => setActiveTab('available')}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === 'available' && styles.activeTabText,
						]}
					>
						Available jobs ({filteredTasks.length})
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={filteredTasks}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<TaskItem task={item} onPress={() => handleOpenTaskDetails(item)} />
				)}
				ListEmptyComponent={
					<Text style={styles.messageText}>
						{activeTab === 'taken'
							? "You haven't taken any tasks yet."
							: 'No available tasks found.'}
					</Text>
				}
				contentContainerStyle={styles.flatListContent}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	centered: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 50,
		backgroundColor: COLORS.background,
	},
	errorText: {
		color: COLORS.accentRed,
		fontSize: 16,
		textAlign: 'center',
	},
	messageText: {
		textAlign: 'center',
		marginTop: 50,
		fontSize: 16,
		color: COLORS.textSecondary,
		paddingHorizontal: 20,
	},
	tabSelector: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 8,
		marginHorizontal: 6,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	activeTab: {
		backgroundColor: COLORS.accentGreen,
		borderColor: COLORS.accentGreen,
	},
	tabText: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.textSecondary,
	},
	activeTabText: {
		color: COLORS.buttonTextDark,
	},
	headerText: {
		fontSize: 26,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		textAlign: 'center',
		marginBottom: 24,
	},
	quickTaskForm: {
		width: '100%',
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: COLORS.background,
		marginBottom: 16,
	},
	quickButton: {
		backgroundColor: COLORS.accentGreen,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		width: '100%',
	},
	quickButtonDisabled: {
		backgroundColor: COLORS.border,
		opacity: 0.7,
	},
	quickButtonText: {
		color: COLORS.buttonTextDark,
		fontSize: 16,
		fontWeight: 'bold',
	},
	detailedButton: {
		backgroundColor: COLORS.border,
		marginTop: 20,
	},
	myTasksHeader: {
		fontSize: 22,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 16,
		alignSelf: 'flex-start',
		paddingHorizontal: 10,
	},
	myTaskWrapper: {
		marginBottom: 16,
		marginHorizontal: 10,
	},
	deleteButton: {
		backgroundColor: COLORS.accentRed,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 6,
	},
	deleteButtonText: {
		color: COLORS.textPrimary,
		fontWeight: 'bold',
	},
	noTasksText: {
		textAlign: 'center',
		color: COLORS.textSecondary,
		marginTop: 10,
	},
	flatListContent: {
		paddingVertical: 20,
		paddingHorizontal: 10,
	},
})
