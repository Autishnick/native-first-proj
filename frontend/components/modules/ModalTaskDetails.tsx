import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

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
import { useAuth } from '../../hooks/useAuthContext'
import { api } from '../../src/api/client'
import { Bidder as BidderType, Task } from '../../types/task.types'

import TaskDetailsDisplay from '../ui/TaskDetailsDisplay'
import EmployerBidderList from './EmployerBidderList'
import WorkerBidSection from './WorkerBidSection'

interface CustomModalProps {
	visible: boolean
	onClose: () => void
	task: Task | null
	onSubmitBid: (bidData: any) => void
}

export default function CustomModal({
	visible,
	onClose,
	task,
	onSubmitBid,
}: CustomModalProps) {
	const { user, profile } = useAuth()
	const loggedInUserId = user?.uid
	const userName = profile?.displayName
	const isWorker = profile?.role === 'worker'

	const router = useRouter()

	const handleAssign = async (bid: BidderType) => {
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			await api.patch(`/tasks/${task.id}/assign`, {
				senderId: bid.senderId,
				senderName: bid.senderName,
				bidId: bid.id,
			})

			Alert.alert('Success', `Task assigned to ${bid.senderName}`)
			onClose()
		} catch (error: any) {
			console.error('Error assigning task:', error)
			const message = error.response?.data?.message || 'Failed to assign task'
			Alert.alert('Error', message)
		}
	}

	const handleDecline = async (bid: BidderType) => {
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			await api.patch(`/tasks/${task.id}/decline`, {
				senderId: bid.senderId,
				bidId: bid.id,
			})

			Alert.alert('Declined', `Bid from ${bid.senderName} has been declined`)
			onClose()
		} catch (error: any) {
			console.error('Error declining bid:', error)
			const message = error.response?.data?.message || 'Failed to decline bid'
			Alert.alert('Error', message)
		}
	}

	const handleMessage = async (bid: BidderType) => {
		if (!task) {
			Alert.alert('Error', 'Task ID not found')
			return
		}

		const recipientName =
			bid.senderName || `User ${bid.senderId?.substring(0, 5)}`

		try {
			const response = await api.post('/chats/find-or-create', {
				taskId: task.id,
				recipientId: bid.senderId,
				recipientName: recipientName,
			})

			const chat = response.data

			router.push({
				pathname: '/messages/[TaskId]',
				params: {
					TaskId: chat.id,

					chatTitle: recipientName,
				},
			})
			onClose()
		} catch (error: any) {
			console.error('Error finding or creating chat:', error)
			const message =
				error.response?.data?.message || 'Could not open the chat.'
			Alert.alert('Error', message)
		}
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
					<TaskDetailsDisplay task={task} />
				</ScrollView>

				{isWorker
					? loggedInUserId && (
							<WorkerBidSection
								task={task}
								userId={loggedInUserId}
								userName={userName ?? ''}
								onSubmitBid={onSubmitBid}
							/>
					  )
					: task &&
					  loggedInUserId && (
							<EmployerBidderList
								taskId={task.id}
								userId={loggedInUserId}
								onAssign={handleAssign}
								onDecline={handleDecline}
								onMessage={handleMessage}
							/>
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
