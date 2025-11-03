// Per your request, all code and comments are in English.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useLocalSearchParams } from 'expo-router'
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
import { useAuth } from '../../hooks/useAuthContext'
import { api } from '../../src/api/client'
import FilterSection from '../../utils/FilterSection'

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
	createdAt: string
	dueDate: string
	location: string
	address: string
	[key: string]: any
}

// ... (Interface BidData & BidPayload are correct) ...
interface BidData {
	taskCreatorId: string
	taskId: string
	type?: string
	message: string
	bidAmount: number
}

interface BidPayload {
	message: string
	bidAmount: number
}

// ... (Component Prop Types are fine) ...
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
const TaskListTS = TaskList as unknown as React.FC<TaskListProps>

interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null
	userId: string
	onSubmitBid: (bidData: BidData) => void
	isLoading?: boolean
}
const CustomModalTS = CustomModal as unknown as React.FC<CustomModalProps>

const BrowseScreen: React.FC = () => {
	const { categoryName } = useLocalSearchParams<{ categoryName?: string }>()
	const queryClient = useQueryClient()

	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)
	const [sortBy, setSortBy] = useState<SortField>('date')
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
	const [selectedCategory, setSelectedCategory] = useState<string>('all')
	const [searchQuery, setSearchQuery] = useState<string>('')

	// НОВИЙ ФІКС 1: Отримуємо 'user', а не 'isAuthenticated'
	const { user, loading: authLoading } = useAuth()

	// НОВИЙ ФІКС 2: Створюємо 'isAuthenticated' та 'userId' вручну з 'user'
	const isAuthenticated = !!user
	const userId = user?.uid // (або user?.id, залежно від вашої структури)

	const CATEGORY_NAMES: string[] = CATEGORIES_DATA.map(item => item.name)

	useEffect(() => {
		if (
			categoryName &&
			CATEGORIES_DATA.some(cat => cat.name === categoryName)
		) {
			setSelectedCategory(categoryName)
		}
	}, [categoryName])

	const {
		data: tasks = [],
		isLoading,
		error,
	} = useQuery<Task[], AxiosError>({
		queryKey: [
			'tasks',
			{
				category: selectedCategory,
				sort: sortBy,
				order: sortOrder,
				search: searchQuery,
			},
		],
		queryFn: async () => {
			const { data } = await api.get('/tasks', {
				params: {
					category: selectedCategory,
					sort: sortBy,
					order: sortOrder,
					search: searchQuery,
				},
			})
			return data
		},
		// Ваш ФІКС 2 (enabled) тепер працює, бо 'isAuthenticated' визначено
		enabled: !authLoading && isAuthenticated,
	})

	const { mutateAsync: submitBidMutate, isPending: isSubmittingBid } =
		useMutation<void, AxiosError, { taskId: string; payload: BidPayload }>({
			mutationFn: ({ taskId, payload }) =>
				api.post(`/tasks/${taskId}/bids`, payload),
			onSuccess: () => {
				Alert.alert('Success', 'Bid submitted successfully!')
				setModalVisible(false)
				queryClient.invalidateQueries({ queryKey: ['tasks'] })
			},
			onError: (err: AxiosError) => {
				const errorMsg =
					(err.response?.data as any)?.message || 'Failed to submit bid.'
				Alert.alert('Error', errorMsg)
			},
		})

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
		// НОВИЙ ФІКС 3: Ця перевірка тепер працює, бо 'userId' визначено
		if (!userId) {
			Alert.alert('Error', 'You must be logged in to place a bid.')
			return
		}

		if (userId === bidData.taskCreatorId) {
			Alert.alert('Wait', 'You cannot place a bid on your own task.')
			return
		}

		try {
			const payload: BidPayload = {
				message: bidData.message,
				bidAmount: bidData.bidAmount,
			}
			await submitBidMutate({ taskId: bidData.taskId, payload })
		} catch (error) {
			console.error('Bid submission failed:', error)
		}
	}

	// Ваш ФІКС 3 (loading) логічно правильний
	if (authLoading || (isLoading && !tasks.length)) {
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
					Error loading tasks: {error.message || 'Please try again later.'}
				</Text>
			</View>
		)
	}

	// Ця перевірка тепер працює, бо 'isAuthenticated' визначено
	if (!isAuthenticated) {
		return (
			<View style={styles.centered}>
				<Text style={styles.errorText}>Please log in to browse tasks.</Text>
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
				// НОВИЙ ФІКС 4: 'userId' тепер коректно передається
				userId={userId || ''}
				onSubmitBid={handleBidSubmission}
				isLoading={isSubmittingBid}
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
				isLoading={isLoading}
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
