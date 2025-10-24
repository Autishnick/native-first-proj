// File: app/(main)/browse.jsx
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	// ScrollView, // Більше не потрібен
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import CustomModal from '../../components/modules/ModalTaskDetails'
import TaskList from '../../components/modules/TaskList' // 1. Імпортуємо TaskList
// import TaskItem from '../../components/ui/TaskItem'; // Більше не потрібен тут
import { CATEGORIES_DATA } from '../../constants/CategoriesData'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import FilterSection from '../../utils/FilterSection'
import { createNotification } from '../../utils/firebaseUtils'

export default function BrowseScreen() {
	const { categoryName } = useLocalSearchParams()
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)
	const { userId, userName } = useAuth()
	const CATEGORY_NAMES = CATEGORIES_DATA.map(item => item.name)

	const [sortBy, setSortBy] = useState('date')
	const [sortOrder, setSortOrder] = useState('desc')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		if (
			categoryName &&
			CATEGORIES_DATA.some(cat => cat.name === categoryName)
		) {
			setSelectedCategory(categoryName)
		}
	}, [categoryName])

	const { tasks, loading, error } = useTasks({
		category: selectedCategory,
		sort: sortBy,
		order: sortOrder,
		searchQuery: searchQuery,
	})

	const handleReset = () => {
		setSortBy('date')
		setSortOrder('desc')
		setSelectedCategory('all')
		setSearchQuery('')
	}

	const handleOpenTaskDetails = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	// File: app/(main)/browse.jsx
	// ...
	const handleBidSubmission = async bidData => {
		// Перейменуємо для ясності
		if (!userId) {
			Alert.alert('Error', 'You must be logged in to place a bid.')
			return
		}
		// Перевіряємо, чи є taskCreatorId в отриманих даних
		if (!bidData.taskCreatorId) {
			Alert.alert('Error', 'Cannot determine the recipient for the bid.')
			console.error(
				'Bid submission failed: Missing taskCreatorId in bidData',
				bidData
			)
			return
		}
		// Перевіряємо, чи користувач не робить ставку на своє завдання
		if (userId === bidData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot place a bid on your own task.')
			return
		}

		try {
			// ✅ ВИПРАВЛЕНО: Створюємо dataToSend правильно
			const dataToSend = {
				recipientId: bidData.taskCreatorId, // Беремо ID автора завдання
				senderId: userId,
				senderName: userName || 'Anonymous User',
				taskId: bidData.taskId, // Передаємо taskId
				type: bidData.type || 'new_bid', // Передаємо тип
				message: bidData.message, // Передаємо повідомлення
				bidAmount: bidData.bidAmount, // Передаємо суму
			}

			await createNotification(dataToSend)

			Alert.alert('Success', 'Bid submitted and creator notified successfully!')
			setModalVisible(false) // Закриваємо модалку деталей
		} catch (error) {
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
			console.error('Bid submission failed:', error)
		}
	}
	// ...

	if (loading && !tasks.length) {
		// Показуємо тільки початкове завантаження
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
				<Text style={styles.loadingText}>Loading tasks...</Text>
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>
					Error loading tasks. Please try again later.
				</Text>
			</View>
		)
	}

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

			<FilterSection
				currentSort={sortBy}
				onSortChange={setSortBy}
				categories={CATEGORY_NAMES}
				currentCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
				sortOrder={sortOrder}
				onSortOrderChange={setSortOrder}
				onReset={handleReset}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			{/* 3. Використовуємо TaskList замість ScrollView */}
			<TaskList
				tasks={tasks}
				onTaskPress={handleOpenTaskDetails}
				isLoading={loading} // Передаємо стан завантаження
				searchQuery={searchQuery} // Передаємо запит для повідомлення "No results"
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
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	loadingText: {
		color: COLORS.textPrimary,
		marginTop: 10,
	},
	errorText: {
		color: COLORS.accentRed, // Використання константи
		fontSize: 16,
	},
	// messageText та scrollContent більше не потрібні тут,
	// вони тепер всередині TaskList
})
