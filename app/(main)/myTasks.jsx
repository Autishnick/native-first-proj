import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
// ⭐️ 1. ІМПОРТУЄМО НОВЕ МОДАЛЬНЕ ВІКНО
import CreateTaskModal from '../../components/modules/CreateDetailTaskModal'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { createNotification } from '../../utils/firebaseUtils'

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

	// ⭐️ 4. Функція для створення ШВИДКОГО завдання
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

	// ⭐️ 4.5. НОВА ФУНКЦІЯ для створення ДЕТАЛЬНОГО завдання (з модального вікна)
	const handleCreateDetailedTask = async taskDataFromModal => {
		if (!userId) {
			Alert.alert('Error', 'Authentication error. Please restart the app.')
			// Повідомляємо модальне вікно про помилку, щоб воно не закрилося
			throw new Error('User not authenticated.')
		}

		try {
			// Додаємо дані користувача до даних з форми
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
				<Text style={styles.headerText}>Need help? Get it done!</Text>

				{/* Форма швидкого завдання */}
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

				{/* ⭐️ РЕНДЕРИМО НОВЕ МОДАЛЬНЕ ВІКНО */}
				<CreateTaskModal
					visible={isDetailedModalVisible}
					onClose={() => setIsDetailedModalVisible(false)}
					onSubmit={handleCreateDetailedTask}
				/>
			</View>
		)
	}

	if (error) {
		// ... (ваш код без змін)
	}

	// 5. Рендеринг (для Воркерів)
	return <View style={styles.container}>{/* ... (ваш код без змін) */}</View>
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
})
