import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
// ⭐️ 1. ІМПОРТУЄМО НОВЕ МОДАЛЬНЕ ВІКНО
import { deleteDoc, doc } from 'firebase/firestore'
import CreateTaskModal from '../../components/modules/CreateDetailTaskModal'
import CustomModal from '../../components/modules/ModalTaskDetails'
import TaskItem from '../../components/ui/TaskItem'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { db } from '../../src/firebase/config'
import { createNotification } from '../../utils/firebaseUtils'

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
	// 1. Стани
	const [activeTab, setActiveTab] = useState('available')
	const [text, setText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	// ⭐️ 2. ДОДАЄМО СТАН ДЛЯ НОВОГО МОДАЛЬНОГО ВІКНА
	const [isDetailedModalVisible, setIsDetailedModalVisible] = useState(false)

	// 2. Отримання даних
	const { userId, isWorker, loading: authLoading, userName } = useAuth()
	const { tasks, loading: tasksLoading, error, createTask } = useTasks()
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	const handleOpenTaskDetails = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleBidSubmission = async notificationData => {
		// ... (ваш код без змін)
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
		// ... (ваш код без змін)
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
			await createTask(taskData)
			Alert.alert('Success!', 'Your task has been posted.')
			setText('')
		} catch (error) {
			console.error('Error creating task:', error)
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

			// Викликаємо ту саму функцію 'createTask' з хука
			await createTask(completeTaskData)

			Alert.alert('Success!', 'Your detailed task has been posted.')
			setIsDetailedModalVisible(false) // Закриваємо модальне вікно при успіху
		} catch (error) {
			console.error('Error creating detailed task:', error)
			// Передаємо помилку, щоб модальне вікно могло її обробити
			throw error
		}
	}

	// 3. Фільтрація завдань
	const filteredTasks = useMemo(() => {
		// ... (ваш код без змін)
		if (activeTab === 'taken') {
			return tasks.filter(task => task.assignedTo === userId)
		}
		return tasks
	}, [activeTab, tasks, userId])

	// 4. Обробка станів завантаження та ролі
	const isLoading = authLoading || tasksLoading

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color='#007AFF' />
			</View>
		)
	}

	// ⭐️ 5. Оновлений блок для НЕ-воркерів (Роботодавців)
	if (!isWorker) {
		return (
			<View style={styles.centered}>
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
						placeholderTextColor='#999'
						onChangeText={newText => setText(newText)}
						value={text}
						editable={!isSubmitting}
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

				{/* ⭐️ НОВА КНОПКА для детального завдання */}
				<TouchableOpacity
					style={[styles.quickButton, styles.detailedButton]} // Додаємо новий стиль
					onPress={() => setIsDetailedModalVisible(true)} // Відкриваємо модалку
				>
					<Text style={styles.quickButtonText}>Create New Detailed Task</Text>
				</TouchableOpacity>

				<CreateTaskModal
					visible={isDetailedModalVisible}
					onClose={() => setIsDetailedModalVisible(false)}
					onSubmit={handleCreateDetailedTask}
				/>
				<ScrollView style={{ width: '100%', marginTop: 30 }}>
					<Text style={styles.myTasksHeader}>
						My Tasks ({tasks.filter(task => task.createdBy === userId).length})
					</Text>

					<FlatList
						data={tasks.filter(task => task.createdBy === userId)}
						keyExtractor={item => item.id}
						renderItem={({ item }) => (
							<View style={styles.myTaskWrapper}>
								<TouchableOpacity onPress={() => handleOpenTaskDetails(item)}>
									{/* Використовуємо готовий компонент TaskItem */}
									<TaskItem task={item} />
								</TouchableOpacity>

								{/* Кнопка видалення */}
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
				</ScrollView>
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

	return (
		<View style={styles.container}>
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
						Available jobs ({tasks.length})
					</Text>
				</TouchableOpacity>
			</View>

			<FlatList
				data={filteredTasks}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<TouchableOpacity onPress={() => handleOpenTaskDetails(item)}>
						<TaskItem task={item} />
					</TouchableOpacity>
				)}
				ListEmptyComponent={
					<Text style={styles.messageText}>
						{activeTab === 'taken'
							? "You haven't taken any tasks yet." // ⭐️ Оновлено текст
							: 'No tasks found.'}
					</Text>
				}
				contentContainerStyle={{ paddingBottom: 20 }}
			/>
		</View>
	)
}

// ⭐️ 6. ОНОВЛЕНІ СТИЛІ
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	centered: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 50,
		backgroundColor: '#F9FAFB',
	},
	errorText: {
		color: 'red',
		fontSize: 16,
		textAlign: 'center',
	},
	messageText: {
		textAlign: 'center',
		marginTop: 50,
		fontSize: 16,
		color: '#888',
	},
	tabSelector: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		backgroundColor: '#F3F4F6',
		borderRadius: 8,
		marginHorizontal: 6,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	activeTab: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	tabText: {
		fontSize: 14,
		fontWeight: '600',
		color: '#374151',
	},
	activeTabText: {
		color: '#FFFFFF',
	},
	headerText: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#0B1A2A',
		textAlign: 'center',
		marginBottom: 24,
	},
	subHeaderText: {
		fontSize: 16,
		color: '#4B5563',
		textAlign: 'center',
		marginBottom: 24,
	},
	quickTaskForm: {
		width: '100%',
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	input: {
		height: 50,
		borderColor: '#E5E7EB',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: '#F9FAFB',
		marginBottom: 16,
	},
	quickButton: {
		backgroundColor: '#4CAF50', // Зелена кнопка
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		shadowColor: '#4CAF50',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
		width: '100%', // ⭐️ ДОДАНО: щоб кнопки були однакової ширини
	},
	quickButtonDisabled: {
		backgroundColor: '#A9A9A9',
		opacity: 0.7,
	},
	quickButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	// ⭐️ НОВІ СТИЛІ для другої кнопки
	detailedButton: {
		backgroundColor: '#007AFF', // Синій колір
		shadowColor: '#007AFF',
		marginTop: 20, // Відступ між формою та кнопкою
	},
	myTasksHeader: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#0B1A2A',
		marginBottom: 16,
		alignSelf: 'flex-start',
	},
	myTaskWrapper: {
		marginBottom: 16,
		marginHorizontal: 10,
	},
	deleteButton: {
		backgroundColor: '#FF3B30',
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 6,
	},
	deleteButtonText: {
		color: '#fff',
		fontWeight: 'bold',
	},
	noTasksText: {
		textAlign: 'center',
		color: '#888',
		marginTop: 10,
	},
})
