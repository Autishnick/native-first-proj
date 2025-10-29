import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import React from 'react'
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

import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../src/firebase/config'
import { Bidder as BidderType, Task } from '../../types/task.types' // Use central types
import {
	createNotification,
	CreateNotificationParams,
} from '../../utils/firebaseUtils'
import TaskDetailsDisplay from '../ui/TaskDetailsDisplay'
import EmployerBidderList from './EmployerBidderList'
import WorkerBidSection from './WorkerBidSection'

// Removed local Task interface
// Removed local Bidder interface

interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null // Use imported Task
	userId: string
	onSubmitBid: (bidData: any) => void // Consider defining a specific type for bidData
}

interface AuthHookValue {
	userName: string | null | undefined
	isWorker: boolean
}

// Removed local CreateNotificationParams, using imported one

export default function CustomModal({
	visible,
	onClose,
	task,
	userId,
	onSubmitBid,
}: CustomModalProps) {
	const { userName, isWorker } = useAuth() as AuthHookValue
	const router = useRouter()

	const handleAssign = async (bid: BidderType) => {
		// Use imported BidderType
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			const notificationPayload: CreateNotificationParams = {
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				recipientName: bid.senderName,
				taskId: task.id,
				type: 'task_assigned',
				message: `You have been assigned to the task "${task.title}"`,
			}
			await createNotification(notificationPayload)

			const taskRef = doc(db, 'tasks', task.id)
			await updateDoc(taskRef, {
				assignedTo: bid.senderId,
				status: 'assigned',
				workerName: bid.senderName,
			})

			if (bid.id) {
				await deleteDoc(doc(db, 'notifications', bid.id))
			}

			Alert.alert('Success', `Task assigned to ${bid.senderName}`)
			onClose()
		} catch (error: unknown) {
			console.error('Error assigning task:', error)
			const message =
				error instanceof Error ? error.message : 'Failed to assign task'
			Alert.alert('Error', message)
		}
	}

	const handleDecline = async (bid: BidderType) => {
		// Use imported BidderType
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			const notificationPayload: CreateNotificationParams = {
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				recipientName: bid.senderName,
				taskId: task.id,
				type: 'bid_declined',
				message: `Your bid for task "${task.title}" was declined.`,
			}
			await createNotification(notificationPayload)

			if (bid.id) {
				await deleteDoc(doc(db, 'notifications', bid.id))
			}

			Alert.alert('Declined', `Bid from ${bid.senderName} has been declined`)
		} catch (error: unknown) {
			console.error('Error declining bid:', error)
			const message =
				error instanceof Error ? error.message : 'Failed to decline bid'
			Alert.alert('Error', message)
		}
	}

	const handleMessage = (bid: BidderType) => {
		// Use imported BidderType
		if (!task) {
			Alert.alert('Error', 'Task ID not found')
			return
		}

		const nameToSend = bid.senderName || `User ${bid.senderId?.substring(0, 5)}`

		router.push({
			pathname: '/messages/[TaskId]',
			params: {
				TaskId: task.id,
				otherUserId: bid.senderId,
				otherUserName: nameToSend,
			},
		})
		onClose()
	}

	return (
		<Modal
			animationType='slide'
			transparent={false}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.fullScreenContainer}>
				<StatusBar barStyle='light-content' />

				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.backButton}>
						<Ionicons name='arrow-back' size={26} color={COLORS.textPrimary} />
					</TouchableOpacity>

					<Text style={styles.headerText}>{task?.title || 'Task Details'}</Text>
				</View>

				<ScrollView contentContainerStyle={styles.scrollContainer}>
					{/* Ensure TaskDetailsDisplay uses the correct imported Task type */}
					<TaskDetailsDisplay task={task} />
				</ScrollView>

				{isWorker ? (
					<WorkerBidSection
						task={task}
						userId={userId}
						userName={userName ?? ''}
						onSubmitBid={onSubmitBid}
					/>
				) : (
					task && (
						// Ensure EmployerBidderList expects the correct imported BidderType
						<EmployerBidderList
							taskId={task.id}
							userId={userId}
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

const styles = StyleSheet.create({
	fullScreenContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop:
			Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
		paddingBottom: 15,
		paddingHorizontal: 16,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	backButton: {
		marginRight: 16,
		padding: 5,
	},
	headerText: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.textPrimary,
		flex: 1,
	},
	scrollContainer: {
		padding: 16,
		paddingBottom: 20,
	},
})
