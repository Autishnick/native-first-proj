import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import CustomModal from '../../components/modules/ModalTaskDetails'
import TaskItem from '../../components/ui/TaskItem'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { CATEGORIES_DATA } from '../../utils/CategoriesData'
import FilterSection from '../../utils/FilterSection'
import { createNotification } from '../../utils/firebaseUtils'
export default function BrowseScreen() {
	const { categoryName } = useLocalSearchParams()
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	// ⭐️ Отримання даних поточного користувача
	const { userId, userName } = useAuth()

	const CATEGORY_NAMES = CATEGORIES_DATA.map(item => item.name)

	const { tasks, loading, error } = useTasks()

	const [sortBy, setSortBy] = useState('date')
	const [sortOrder, setSortOrder] = useState('desc')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		if (categoryName && CATEGORY_NAMES.includes(categoryName)) {
			setSelectedCategory(categoryName)
		}
	}, [categoryName])

	const filteredAndSortedTasks = useMemo(() => {
		let filteredTasks = tasks.filter(
			task => selectedCategory === 'all' || task.category === selectedCategory
		)

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			filteredTasks = filteredTasks.filter(
				task =>
					task.title?.toLowerCase().includes(query) ||
					task.description?.toLowerCase().includes(query) ||
					task.category?.toLowerCase().includes(query)
			)
		}

		const tasksToSort = [...filteredTasks]

		switch (sortBy) {
			case 'alphabet':
				return tasksToSort.sort((a, b) =>
					sortOrder === 'asc'
						? a.title.localeCompare(b.title)
						: b.title.localeCompare(a.title)
				)
			case 'price':
				return tasksToSort.sort((a, b) =>
					sortOrder === 'asc' ? a.payment - b.payment : b.payment - a.payment
				)
			case 'date':
			default:
				return tasksToSort.sort((a, b) => {
					const dateA = a.createdAt?.toDate?.()?.getTime?.() || 0
					const dateB = b.createdAt?.toDate?.()?.getTime?.() || 0
					return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
				})
		}
	}, [tasks, sortBy, sortOrder, selectedCategory, searchQuery])

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

	// ⭐️ ФУНКЦІЯ ОБРОБКИ СТАВКИ ТА НАДСИЛАННЯ ПОВІДОМЛЕННЯ НА FIREBASE
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
				senderName: userName || 'Anonymous User', // Забезпечуємо наявність імені
			}

			await createNotification(dataToSend)

			Alert.alert('Success', 'Bid submitted and creator notified successfully!')
			setModalVisible(false)
		} catch (error) {
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
			console.error('Bid submission failed:', error)
		}
	}

	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size='large' color='#007AFF' />
				<Text>Loading tasks...</Text>
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
			<CustomModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				title={selectedTask ? selectedTask.title : 'Task details'}
				tasks={selectedTask ? [selectedTask] : []}
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

			{/* 🔹 Список тасків */}
			<ScrollView>
				{filteredAndSortedTasks.length > 0 ? (
					filteredAndSortedTasks.map(task => (
						<TouchableOpacity
							key={task.id}
							activeOpacity={0.8}
							onPress={() => handleOpenTaskDetails(task)}
						>
							<TaskItem task={task} />
						</TouchableOpacity>
					))
				) : (
					<Text style={styles.messageText}>
						{searchQuery.trim()
							? `No tasks found for "${searchQuery}"`
							: 'No tasks found for this selection.'}
					</Text>
				)}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		color: 'red',
		fontSize: 16,
	},
	messageText: {
		textAlign: 'center',
		marginTop: 50,
		fontSize: 16,
		color: '#888',
	},
})
