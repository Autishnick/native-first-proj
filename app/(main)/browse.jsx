import { useMemo, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import FilterSection from '../../components/modules/FilterSection'
import TaskItem from '../../components/ui/TaskItem'
import { useTasks } from '../../hooks/useTasks'

const TASK_CATEGORIES = [
	'HandyMan',
	'Electrician',
	'Construction Cleaning',
	'Painter',
	'Home Cleaning',
	'Gardening',
	'Flooring',
	'Air Condition technician',
]

export default function BrowseScreen() {
	const { tasks, loading, error } = useTasks()
	const [sortBy, setSortBy] = useState('date')
	const [sortOrder, setSortOrder] = useState('desc')
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')

	const filteredAndSortedTasks = useMemo(() => {
		// Фільтр по категорії
		let filteredTasks = tasks.filter(
			task => selectedCategory === 'all' || task.category === selectedCategory
		)

		// Фільтр по пошуковому запиту
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

		let sortedTasks
		switch (sortBy) {
			case 'alphabet':
				sortedTasks = tasksToSort.sort((a, b) => {
					return sortOrder === 'asc'
						? a.title.localeCompare(b.title)
						: b.title.localeCompare(a.title)
				})
				break
			case 'price':
				sortedTasks = tasksToSort.sort((a, b) => {
					return sortOrder === 'asc'
						? a.payment - b.payment
						: b.payment - a.payment
				})
				break
			case 'date':
			default:
				sortedTasks = tasksToSort.sort((a, b) => {
					const dateA = a.createdAt?.toDate()?.getTime() || 0
					const dateB = b.createdAt?.toDate()?.getTime() || 0
					return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
				})
				break
		}
		return sortedTasks
	}, [tasks, sortBy, sortOrder, selectedCategory, searchQuery])

	const handleReset = () => {
		setSortBy('date')
		setSortOrder('desc')
		setSelectedCategory('all')
		setSearchQuery('')
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
			<FilterSection
				currentSort={sortBy}
				onSortChange={setSortBy}
				categories={TASK_CATEGORIES}
				currentCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
				sortOrder={sortOrder}
				onSortOrderChange={setSortOrder}
				onReset={handleReset}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			{/* Список завдань */}
			<ScrollView>
				{filteredAndSortedTasks.length > 0 ? (
					filteredAndSortedTasks.map(task => (
						<TaskItem key={task.id} task={task} />
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
