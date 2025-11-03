import React, { useMemo, useState } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../constants/colors'
import TaskTabs from '../ui/TaskTabs'
import CustomModal from './ModalTaskDetails'
import TaskList from './TaskList'

import { Task } from '../../types/task.types'

type ActiveTab = 'available' | 'taken'

interface WorkerTaskViewProps {
	userId: string
	tasks: Task[]
	handleOpenTaskDetails: (task: Task) => void
	handleBidSubmission: (bidData: any) => void
}
interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null
	userId: string
	onSubmitBid: (bidData: any) => void
}
const CustomModalTS = CustomModal as React.FC<CustomModalProps>

export default function WorkerTaskView({
	userId,
	tasks,
	handleOpenTaskDetails,
	handleBidSubmission,
}: WorkerTaskViewProps) {
	const [activeTab, setActiveTab] = useState<ActiveTab>('available')
	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [selectedTask, setSelectedTask] = useState<Task | null>(null)

	const filteredTasks: Task[] = useMemo(() => {
		if (activeTab === 'taken') {
			return tasks.filter(task => task.assignedTo === userId)
		}

		return tasks.filter(task => !task.assignedTo)
	}, [activeTab, tasks, userId])

	const openDetailsModal = (task: Task) => {
		setSelectedTask(task)
		setModalVisible(true)
	}

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

			<TaskTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				availableTaskCount={tasks.filter(task => !task.assignedTo).length}
			/>

			<TaskList
				tasks={filteredTasks}
				onTaskPress={openDetailsModal}
				isLoading={false}
				searchQuery={null}
			/>

			{filteredTasks.length === 0 && (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>
						{activeTab === 'taken'
							? "You haven't taken any jobs yet."
							: 'No available jobs found.'}
					</Text>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
})
