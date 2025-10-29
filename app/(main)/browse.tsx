import { useLocalSearchParams } from 'expo-router'
import { FirestoreError, Timestamp } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StatusBar,
	StyleSheet,
	Text,
	View,
} from 'react-native'

import CustomModal from '../../components/modules/ModalTaskDetails'
import TaskList from '../../components/modules/TaskList'
import { CATEGORIES_DATA } from '../../constants/CategoriesData'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import FilterSection from '../../utils/FilterSection'
import { createNotification } from '../../utils/firebaseUtils'

type SortField = 'date' | 'price' | 'alphabet'
type SortOrder = 'asc' | 'desc'
type TaskStatus = 'available' | 'in_progress' | 'completed'

interface Task {
	id: string
	title: string
	description: string
	category: string
	payment: number
	status: TaskStatus
	createdBy: string | null
	assignedTo: string | null
	createdAt: Timestamp
	dueDate: Timestamp
	location: string
	address: string
	[key: string]: any
}

interface AuthHookValue {
	userId: string | null | undefined
	userName: string | null | undefined
}

interface TasksHookValue {
	tasks: Task[]
	loading: boolean
	error: FirestoreError | null
}

interface CreateNotificationParams {
	recipientId: string
	senderId: string
	senderName: string
	taskId: string
	type: string
	message: string
	bidAmount: number
}

interface BidData {
	taskCreatorId: string
	taskId: string
	type?: string
	message: string
	bidAmount: number
}

interface FilterSectionProps {
	categories: string[]
	currentCategory: string
	onCategoryChange: (category: string) => void
	currentSort: SortField
	onSortChange: (sort: SortField) => void
	sortOrder: SortOrder
	onSortOrderChange: React.Dispatch<React.SetStateAction<SortOrder>>
	searchQuery: string
	onSearchChange: (query: string) => void
	onReset: () => void
}

const FilterSectionTS = FilterSection as React.FC<FilterSectionProps>

interface TaskListProps {
	tasks: Task[]
	onTaskPress: (task: Task) => void
	isLoading: boolean
	searchQuery: string | null
	onSubmit?: (text: string) => Promise<void> | void
}

const TaskListTS = TaskList as React.FC<TaskListProps>

interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null
	userId: string
	onSubmitBid: (bidData: BidData) => void
}

const CustomModalTS = CustomModal as React.FC<CustomModalProps>

const BrowseScreen: React.FC = () => {
	const { categoryName } = useLocalSearchParams<{ categoryName?: string }>()

	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [sortBy, setSortBy] = useState<SortField>('date')
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [searchQuery, setSearchQuery] = useState<string>('')

	const { userId, userName } = useAuth() as AuthHookValue
	const CATEGORY_NAMES: string[] = CATEGORIES_DATA.map(item => item.name)

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
	}) as TasksHookValue

	const handleReset = (): void => {
		setSortBy('date')
		setSortOrder('desc')
		setSelectedCategory('all')
		setSearchQuery('')
	}

	const handleOpenTaskDetails = (task: Task): void => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	const handleBidSubmission = async (bidData: BidData): Promise<void> => {
		if (!userId) {
			Alert.alert('Error', 'You must be logged in to place a bid.')
			return
		}

		if (!bidData.taskCreatorId) {
			Alert.alert('Error', 'Cannot determine the recipient for the bid.')
			console.error(
				'Bid submission failed: Missing taskCreatorId in bidData',
				bidData
			)
			return
		}

		if (userId === bidData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot place a bid on your own task.')
			return
		}

		try {
			const dataToSend: CreateNotificationParams = {
				recipientId: bidData.taskCreatorId,
				senderId: userId,
				senderName: userName || 'Anonymous User',
				taskId: bidData.taskId,
				type: bidData.type || 'new_bid',
				message: bidData.message,
				bidAmount: bidData.bidAmount,
			}

			await createNotification(dataToSend)

			Alert.alert('Success', 'Bid submitted and creator notified successfully!')
			setModalVisible(false)
		} catch (error: unknown) {
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
			if (error instanceof Error) {
				console.error('Bid submission failed:', error.message)
			} else {
				console.error('Bid submission failed:', error)
			}
		}
	}

	if (loading && !tasks.length) {
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
			<CustomModalTS
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				task={selectedTask}
				userId={userId || ''}
				onSubmitBid={handleBidSubmission}
			/>

			<FilterSectionTS
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

			<TaskListTS
				tasks={tasks}
				onTaskPress={handleOpenTaskDetails}
				isLoading={loading}
				searchQuery={searchQuery}
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
		color: COLORS.accentRed,
		fontSize: 16,
	},
})

export default BrowseScreen
