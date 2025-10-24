// File: components/modules/ModalTaskDetails.jsx
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore' // Firebase imports needed here
import {
	Alert,
	Modal,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

import { useAuth } from '../../hooks/useAuth'
// Import extracted components
import { COLORS } from '../../constants/colors'
import { db } from '../../src/firebase/config' // Import db
import { createNotification } from '../../utils/firebaseUtils' // Import createNotification
import TaskDetailsDisplay from '../ui/TaskDetailsDisplay'
import EmployerBidderList from './EmployerBidderList'
import WorkerBidSection from './WorkerBidSection'

export default function CustomModal({
	visible,
	onClose,
	task, // Now receives a single task object
	userId, // Receive userId directly
	onSubmitBid, // Receive the original handler
}) {
	const { userName, isWorker } = useAuth() // Get role and name
	const router = useRouter()

	// --- Handlers for Employer Actions ---
	const handleAssign = async bid => {
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			// Create notification for the worker
			await createNotification({
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				taskId: task.id,
				type: 'task_assigned',
				message: `You have been assigned to the task "${task.title}"`,
			})

			// Update the task document
			const taskRef = doc(db, 'tasks', task.id)
			await updateDoc(taskRef, {
				assignedTo: bid.senderId,
				status: 'assigned', // Or 'in_progress' depending on your flow
				workerName: bid.senderName, // Store worker name on task
			})

			// Delete the bid notification (optional, keeps notification list cleaner)
			if (bid.id) {
				// Check if bid has an ID (it should be the notification ID)
				await deleteDoc(doc(db, 'notifications', bid.id))
			}

			Alert.alert('Success', `Task assigned to ${bid.senderName}`)
			onClose() // Close modal after assigning
		} catch (error) {
			console.error('Error assigning task:', error)
			Alert.alert('Error', 'Failed to assign task')
		}
	}

	const handleDecline = async bid => {
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			// Notify the worker
			await createNotification({
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				taskId: task.id,
				type: 'bid_declined',
				message: `Your bid for task "${task.title}" was declined.`,
			})

			// Delete the bid notification
			if (bid.id) {
				await deleteDoc(doc(db, 'notifications', bid.id))
			}

			Alert.alert('Declined', `Bid from ${bid.senderName} has been declined`)
			// Optionally refresh the bidder list here or rely on the hook's snapshot
		} catch (error) {
			console.error('Error declining bid:', error)
			Alert.alert('Error', 'Failed to decline bid')
		}
	}

	const handleMessage = bid => {
		if (!task) {
			Alert.alert('Error', 'Task ID not found')
			return
		}

		const nameToSend = bid.senderName || `User ${bid.senderId?.substring(0, 5)}`
		router.push({
			pathname: `/messages/${task.id}`,
			params: {
				taskId: task.id,
				otherUserId: bid.senderId,
				otherUserName: nameToSend,
			},
		})
		onClose() // Close modal before navigating
	}

	return (
		<Modal
			animationType='slide'
			transparent={false} // Use false for full screen
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.fullScreenContainer}>
				<StatusBar barStyle='light-content' />
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.backButton}>
						<Ionicons name='arrow-back' size={26} color={COLORS.textPrimary} />
					</TouchableOpacity>
					{/* Title can be dynamic if needed */}
					<Text style={styles.headerText}>{task?.title || 'Task Details'}</Text>
				</View>

				{/* Scrollable Task Details */}
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					{/* Use the extracted TaskDetailsDisplay component */}
					<TaskDetailsDisplay task={task} />
				</ScrollView>

				{/* Conditional Bid Section (Worker or Employer) */}
				{isWorker ? (
					<WorkerBidSection
						task={task}
						userId={userId}
						userName={userName}
						onSubmitBid={onSubmitBid} // Pass the original handler
					/>
				) : (
					task && ( // Only show Employer list if task exists
						<EmployerBidderList
							taskId={task.id}
							userId={userId} // Employer's ID to fetch correct bids
							onAssign={handleAssign}
							onDecline={handleDecline}
							onMessage={handleMessage}
						/>
					)
				)}
			</View>
		</Modal>
	)
}

// Styles relevant to the Modal structure itself
const styles = StyleSheet.create({
	fullScreenContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10, // Adjust for status bar
		paddingBottom: 15, // Reduced padding
		paddingHorizontal: 16,
		backgroundColor: COLORS.card, // Header background
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: {
		marginRight: 16, // Increased spacing
		padding: 5, // Make touch target slightly larger
	},
	headerText: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.textPrimary,
		flex: 1, // Allow text to take remaining space
	},
	scrollContainer: {
		padding: 16,
		paddingBottom: 20, // Ensure content doesn't hide behind bid section
	},
	// Styles for TaskDetailsDisplay, WorkerBidSection, EmployerBidderList, BidderCard
	// are now in their respective component files.
})
