// File: components/modules/WorkerTaskView.jsx
import { useMemo, useState } from 'react'
import { StatusBar, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../constants/colors'
import TaskTabs from '../ui/TaskTabs'
import CustomModal from './ModalTaskDetails' // Assuming path
import TaskList from './TaskList' // Assuming TaskList is in modules folder

export default function WorkerTaskView({
	userId,
	tasks, // Full list from useTasks
	handleOpenTaskDetails, // Function from MyTasksScreen
	handleBidSubmission, // Function from MyTasksScreen
}) {
	const [activeTab, setActiveTab] = useState('available')
	const [modalVisible, setModalVisible] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)

	// Filter tasks based on the active tab
	const filteredTasks = useMemo(() => {
		if (activeTab === 'taken') {
			return tasks.filter(task => task.assignedTo === userId)
		}
		// For 'available', show tasks that are not assigned to anyone
		return tasks.filter(task => !task.assignedTo)
	}, [activeTab, tasks, userId])

	// Wrapper for handleOpenTaskDetails to manage local state
	const openDetailsModal = task => {
		setSelectedTask(task)
		setModalVisible(true)
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<CustomModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				task={selectedTask} // Pass single task
				userId={userId}
				onSubmitBid={handleBidSubmission}
			/>

			<TaskTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				availableTaskCount={tasks.filter(task => !task.assignedTo).length} // Calculate count here
			/>

			<TaskList
				tasks={filteredTasks}
				onTaskPress={openDetailsModal} // Use the wrapper
				// Pass a custom empty message based on the tab
				searchQuery={null} // searchQuery is not used here, pass null or specific messages
				// Custom empty component can be passed via props if needed, or handled inside TaskList
			/>
			{/* Alternative empty state rendering if TaskList doesn't handle it well */}
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
		// Style for the empty message if rendered here
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		// Style for the empty message if rendered here
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
})
