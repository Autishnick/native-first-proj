import { Ionicons } from '@expo/vector-icons'
import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc,
	where,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import {
	Alert,
	Modal,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { db } from '../../src/firebase/config'
import { createNotification } from '../../utils/firebaseUtils'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399', // Main accent (Submit, Bid Value)
	accentRed: '#F56565', // Decline, Destructive actions
	accentBlue: '#4299E1', // Assign
	buttonTextDark: '#1A202C',
	border: '#4A5568',
	bidSection: '#0B1A2A', // Darker area for the bid/admin controls
}

export default function CustomModal({
	visible,
	onClose,
	tasks = [],
	searchQuery = '',
}) {
	const { userId, userName, isWorker } = useAuth()
	const { addBid } = useTasks()
	const initialBidPrice = '0'
	const [editing, setEditing] = useState(false)
	const [bidPrice, setBidPrice] = useState(initialBidPrice)
	const [tempBidPrice, setTempBidPrice] = useState(initialBidPrice)
	const [authorNicknames, setAuthorNicknames] = useState({})
	const [bidders, setBidders] = useState([])
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		const fetchAuthorNicknames = async () => {
			const nicknames = {}
			for (const task of tasks) {
				if (task.createdBy && !nicknames[task.createdBy]) {
					try {
						const userDoc = await getDoc(doc(db, 'users', task.createdBy))
						if (userDoc.exists()) {
							nicknames[task.createdBy] =
								userDoc.data().displayName || 'Unknown'
						} else {
							nicknames[task.createdBy] = 'Unknown'
						}
					} catch (error) {
						console.error('Error fetching author nickname:', error)
						nicknames[task.createdBy] = 'Error'
					}
				}
			}
			setAuthorNicknames(nicknames)
		}
		if (tasks.length > 0) {
			fetchAuthorNicknames()
		}
	}, [tasks])

	useEffect(() => {
		if (!isWorker && tasks.length > 0 && userId) {
			const fetchBids = async () => {
				try {
					const task = tasks[0]

					const q = query(
						collection(db, 'notifications'),
						where('taskId', '==', task.id),
						where('recipientId', '==', userId)
					)
					const snapshot = await getDocs(q)

					const bidNotifications = snapshot.docs
						.map(doc => ({ id: doc.id, ...doc.data() }))
						.filter(n => n.type === 'new_bid')

					const biddersPromises = bidNotifications.map(async bid => {
						const userDocRef = doc(db, 'users', bid.senderId)
						const userDoc = await getDoc(userDocRef)
						const userData = userDoc.exists() ? userDoc.data() : {}

						return {
							...bid,
							proposalMessage: bid.message,
							avatarUrl: userData.avatarUrl || null,
						}
					})

					const combinedBidders = await Promise.all(biddersPromises)
					setBidders(combinedBidders)
				} catch (error) {
					console.error('Error fetching bids and user details:', error)
				}
			}
			fetchBids()
		}
	}, [isWorker, tasks, userId])

	const handleBidPriceChange = text => {
		const newText = text.replace(/[^0-9]/g, '')
		setTempBidPrice(newText)
	}

	const handleEdit = () => {
		if (!editing) setTempBidPrice(bidPrice)
		setEditing(true)
	}

	const handleSave = () => {
		const finalPrice = tempBidPrice === '' ? '0' : tempBidPrice
		setBidPrice(finalPrice)
		setEditing(false)
	}

	const handleCancel = () => {
		setTempBidPrice(bidPrice)
		setEditing(false)
	}

	const handleSubmitBid = async () => {
		if (bidPrice === '0' || bidPrice === '') {
			Alert.alert('Error', 'Please enter a valid bid amount')
			return
		}
		if (tasks.length === 0) {
			Alert.alert('Error', 'No task found')
			return
		}

		const task = tasks[0]
		if (task.createdBy === userId) {
			Alert.alert('Error', 'You cannot place a bid on your own task.')
			return
		}

		setSubmitting(true)
		setEditing(false)

		try {
			await createNotification({
				recipientId: task.createdBy,
				senderId: userId,
				senderName: userName || 'Anonymous',
				taskId: task.id,
				type: 'new_bid',
				message: `I am interested in this task.`,
				bidAmount: parseInt(bidPrice),
			})

			await addBid(task.id, {
				workerName: userName || 'Anonymous',
				bidAmount: parseInt(bidPrice),
			})

			Alert.alert('Success', `Bid of $${bidPrice} submitted successfully!`)
			setBidPrice(initialBidPrice)
			setTempBidPrice(initialBidPrice)
			onClose()
		} catch (error) {
			console.error('Error submitting bid:', error)
			if (error.code === 'permission-denied') {
				Alert.alert(
					'Error',
					'Failed to submit bid. Please check your permissions and try again.'
				)
			} else {
				Alert.alert('Error', 'Failed to submit bid. Please try again.')
			}
		} finally {
			setSubmitting(false)
		}
	}

	const handleAssign = async bid => {
		if (!tasks[0]) {
			Alert.alert('Error', 'No task selected')
			return
		}

		try {
			await createNotification({
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				taskId: tasks[0].id,
				type: 'task_assigned',
				message: `You have been assigned to the task "${tasks[0].title}"`,
			})

			const taskRef = doc(db, 'tasks', tasks[0].id)
			await updateDoc(taskRef, {
				assignedTo: bid.senderId,
				status: 'assigned',
				workerName: bid.senderName,
			})

			await deleteDoc(doc(db, 'notifications', bid.id))

			setBidders(prevBidders => prevBidders.filter(b => b.id !== bid.id))

			Alert.alert('Success', `Task assigned to ${bid.senderName}`)
			onClose()
		} catch (error) {
			console.error('Error assigning task:', error)
			Alert.alert('Error', 'Failed to assign task')
		}
	}

	const handleDecline = async bid => {
		try {
			await createNotification({
				recipientId: bid.senderId,
				senderId: userId,
				senderName: userName || 'Admin',
				taskId: tasks[0].id,
				type: 'bid_declined',
				message: `Your bid for task "${tasks[0].title}" was declined.`,
			})

			await deleteDoc(doc(db, 'notifications', bid.id))

			setBidders(prevBidders => prevBidders.filter(b => b.id !== bid.id))

			Alert.alert('Declined', `Bid from ${bid.senderName} has been declined`)
		} catch (error) {
			console.error('Error declining bid:', error)
			Alert.alert('Error', 'Failed to decline bid')
		}
	}

	const handleMessage = bid => {
		Alert.prompt(
			`Message ${bid.senderName}`,
			'Type your message below:',
			async message => {
				if (!message || message.trim() === '') return
				try {
					await createNotification({
						recipientId: bid.senderId,
						senderId: userId,
						senderName: userName || 'Admin',
						taskId: tasks[0].id,
						type: 'message',
						message: message.trim(),
					})
					Alert.alert('Sent', 'Message has been sent!')
				} catch (error) {
					console.error('Error sending message:', error)
					Alert.alert('Error', 'Failed to send message')
				}
			},
			'plain-text'
		)
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
					<Text style={styles.headerText}>Task details</Text>
				</View>

				<ScrollView contentContainerStyle={styles.scrollContainer}>
					{tasks.length > 0 ? (
						tasks.map(task => {
							const formattedDate = task.dueDate?.seconds
								? new Date(task.dueDate.seconds * 1000).toLocaleDateString()
								: 'N/A'
							const authorNickname =
								authorNicknames[task.createdBy] || 'Loading...'
							return (
								<View key={task.id} style={styles.taskContainer}>
									<Text style={styles.title}>{task.title}</Text>
									<Text style={styles.description}>
										Created by: {authorNickname}
									</Text>
									{task.location && (
										<Text style={styles.description}>
											Location: {task.location}
										</Text>
									)}
									<Text style={styles.description}>
										Target Date: {formattedDate}
									</Text>
									<Text style={styles.description}>
										Payment: {task.payment} USD
									</Text>
									<Text style={styles.description}>{task.description}</Text>
								</View>
							)
						})
					) : (
						<Text style={styles.messageText}>
							{searchQuery.trim()
								? `No tasks found for "${searchQuery}"`
								: 'No tasks available.'}
						</Text>
					)}
				</ScrollView>

				{isWorker ? (
					<View style={styles.bidSection}>
						<View style={styles.bidHeader}>
							<Text style={styles.bidLabel}>Your Bid Price</Text>
							<TouchableOpacity
								style={styles.editButton}
								onPress={handleEdit}
								disabled={submitting}
							>
								<Ionicons
									name='pencil'
									size={18}
									color={COLORS.buttonTextDark}
								/>
								<Text style={styles.editText}>Edit</Text>
							</TouchableOpacity>
						</View>

						{editing ? (
							<>
								<TextInput
									style={styles.input}
									keyboardType='numeric'
									value={tempBidPrice}
									onChangeText={handleBidPriceChange}
									color={COLORS.accentGreen}
								/>
								<View style={styles.controlButtonContainer}>
									<TouchableOpacity
										style={styles.saveButton}
										onPress={handleSave}
									>
										<Text style={styles.saveText}>Save</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.cancelButton}
										onPress={handleCancel}
									>
										<Text style={styles.cancelText}>Cancel</Text>
									</TouchableOpacity>
								</View>
							</>
						) : (
							<Text style={styles.bidValue}>${bidPrice}</Text>
						)}

						<TouchableOpacity
							style={[
								styles.submitButton,
								submitting && styles.submitButtonDisabled,
							]}
							onPress={handleSubmitBid}
							disabled={submitting}
						>
							<Text style={styles.submitText}>
								{submitting ? 'Submitting...' : 'Submit Bid'}
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.bidSection}>
						<Text style={styles.bidLabel}>Workers who applied:</Text>
						{bidders && bidders.length > 0 ? (
							<ScrollView horizontal style={styles.horizontalScroll}>
								{bidders.map(bid => (
									<View key={bid.id} style={styles.bidderCard}>
										<View style={styles.bidderHeader}>
											<View style={[styles.avatar, styles.avatarPlaceholder]}>
												<Ionicons
													name='person'
													size={28}
													color={COLORS.textSecondary}
												/>
											</View>

											<View style={styles.bidderInfo}>
												<Text style={styles.bidderName}>{bid.senderName}</Text>
											</View>
										</View>

										<View style={styles.bidDetails}>
											<Text style={styles.bidAmountText}>
												Bid: ${bid.bidAmount}
											</Text>
											<Text style={styles.proposalMessage}>
												"
												{bid.proposalMessage || 'I am interested in this task.'}
												"
											</Text>
										</View>

										<View style={styles.actionRow}>
											<TouchableOpacity
												style={styles.actionButton}
												onPress={() => handleAssign(bid)}
											>
												<Text style={styles.actionTextAssign}>Assign</Text>
											</TouchableOpacity>

											<TouchableOpacity
												style={styles.actionButton}
												onPress={() => handleMessage(bid)}
											>
												<Text style={styles.actionTextMessage}>Message</Text>
											</TouchableOpacity>

											<TouchableOpacity
												style={styles.actionButton}
												onPress={() => handleDecline(bid)}
											>
												<Text style={styles.actionTextDecline}>Decline</Text>
											</TouchableOpacity>
										</View>
									</View>
								))}
							</ScrollView>
						) : (
							<Text style={styles.noBidsText}>No bids yet</Text>
						)}
					</View>
				)}
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	fullScreenContainer: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 16,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		elevation: 3,
	},
	backButton: { marginRight: 12 },
	headerText: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	scrollContainer: { padding: 16, paddingBottom: 20 },
	taskContainer: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	description: {
		marginTop: 10,
		color: COLORS.textSecondary,
		lineHeight: 22,
		fontSize: 16,
	},
	title: {
		marginBottom: 10,
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
	},
	messageText: {
		textAlign: 'center',
		color: COLORS.textSecondary,
		marginTop: 60,
		fontSize: 16,
	},
	// --- Worker Bid Section / Admin Bidders List ---
	bidSection: {
		backgroundColor: COLORS.bidSection,
		padding: 16,
		paddingBottom: 34,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		marginTop: 'auto',
	},
	bidHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	bidLabel: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 10,
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.textPrimary,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	editText: {
		marginLeft: 5,
		color: COLORS.buttonTextDark,
		fontWeight: '500',
	},
	bidValue: {
		fontSize: 30,
		color: COLORS.accentGreen,
		fontWeight: '700',
		marginVertical: 10,
	},
	input: {
		fontSize: 30,
		color: COLORS.accentGreen,
		fontWeight: '700',
		marginVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.accentGreen,
		paddingBottom: 5,
	},
	submitButton: {
		backgroundColor: COLORS.accentGreen,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 10,
	},
	submitButtonDisabled: { backgroundColor: COLORS.border, opacity: 0.8 },
	submitText: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.buttonTextDark,
	},
	controlButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	saveButton: {
		flex: 1,
		backgroundColor: COLORS.accentGreen,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginRight: 8,
	},
	saveText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.buttonTextDark,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: COLORS.border,
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginLeft: 8,
	},
	cancelText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},

	// --- Admin Bidder Card Styles ---
	horizontalScroll: {
		paddingVertical: 10,
		marginHorizontal: -16,
		paddingHorizontal: 16,
	},
	noBidsText: {
		color: COLORS.textSecondary,
		fontStyle: 'italic',
		marginTop: 10,
		textAlign: 'center',
	},
	bidderCard: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 16,
		marginRight: 10,
		width: 250, // Fixed width for horizontal scroll
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
	},
	bidderHeader: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
		backgroundColor: COLORS.border,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarPlaceholder: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	bidderInfo: {
		flex: 1,
		justifyContent: 'center',
	},
	bidderName: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	bidDetails: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	bidAmountText: {
		fontSize: 16,
		fontWeight: '700',
		color: COLORS.accentGreen,
		marginBottom: 8,
	},
	proposalMessage: {
		fontSize: 14,
		fontStyle: 'italic',
		color: COLORS.textSecondary,
		lineHeight: 20,
	},
	actionRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		paddingTop: 12,
	},
	actionButton: {
		paddingVertical: 4,
		paddingHorizontal: 6,
	},
	actionTextAssign: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.accentBlue,
	},
	actionTextMessage: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	actionTextDecline: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.accentRed,
	},
})
