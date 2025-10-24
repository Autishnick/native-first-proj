import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import {
	createNotification,
	markNotificationAsRead,
	subscribeToNotifications,
} from '../../utils/firebaseUtils'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	unreadBackground: '#374151',
	readBackground: '#2D3748',
	border: '#4A5568',
}

export default function NotificationsScreen() {
	const { userId, userName } = useAuth()
	const [notifications, setNotifications] = useState([])
	const [loading, setLoading] = useState(true)

	const [modalVisible, setModalVisible] = useState(false)
	const [selectedNotification, setSelectedNotification] = useState(null)
	const [replyText, setReplyText] = useState('')
	const [isSending, setIsSending] = useState(false)

	useEffect(() => {
		setLoading(true)
		if (!userId) {
			setLoading(false)
			return
		}

		const unsubscribe = subscribeToNotifications(
			userId,
			newNotifications => {
				setNotifications(newNotifications)
				setLoading(false)
			},
			error => {
				console.error('Error listening to notifications:', error)
				setLoading(false)
			}
		)

		return () => unsubscribe()
	}, [userId])

	const handlePress = async item => {
		if (!item.read) {
			await markNotificationAsRead(item.id)
		}
		setSelectedNotification(item)
		setModalVisible(true)
	}

	const handleCloseModal = () => {
		setModalVisible(false)
		setSelectedNotification(null)
		setReplyText('')
		setIsSending(false)
	}

	const handleSendReply = async () => {
		if (!replyText.trim() || !selectedNotification || isSending) return

		setIsSending(true)

		const notificationData = {
			message: replyText,
			type: 'REPLY',
			senderId: userId,
			senderName: userName || 'Anonymous',
			recipientId: selectedNotification.senderId,
			taskId: selectedNotification.taskId,
			bidAmount: null,
		}

		try {
			await createNotification(notificationData)
			Alert.alert('Success', 'Your reply has been sent!')
			handleCloseModal()
		} catch (error) {
			console.error('Failed to send reply:', error)
			Alert.alert('Error', 'Failed to send reply. Please try again.')
			setIsSending(false)
		}
	}

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={[styles.item, item.read ? styles.read : styles.unread]}
			onPress={() => handlePress(item)}
		>
			<View style={styles.messageContent}>
				<Text style={styles.messageText}>
					<Text style={{ fontWeight: item.read ? 'normal' : '700' }}>
						{item.senderName}
					</Text>
					{item.type === 'NEW_BID'
						? ' made a new bid: '
						: item.type === 'REPLY'
						? ' replied: '
						: ' sent: '}
					{item.type !== 'NEW_BID' && item.message}
				</Text>
				{item.type === 'NEW_BID' && (
					<Text style={styles.bidAmount}>${item.bidAmount}</Text>
				)}
			</View>
			<Text style={styles.timeText}>
				{item.createdAt?.toDate().toLocaleTimeString()}
			</Text>
		</TouchableOpacity>
	)

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<FlatList
				data={notifications}
				renderItem={renderItem}
				keyExtractor={item => item.id}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No messages yet.</Text>
				}
			/>

			<Modal
				animationType='slide'
				transparent={true}
				visible={modalVisible}
				onRequestClose={handleCloseModal}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							Reply to {selectedNotification?.senderName}
						</Text>
						<TextInput
							style={styles.modalInput}
							placeholder='Type your message...'
							placeholderTextColor={COLORS.textSecondary}
							value={replyText}
							onChangeText={setReplyText}
							multiline
						/>
						<View style={styles.modalButtonContainer}>
							<TouchableOpacity
								style={[styles.modalButton, styles.closeButton]}
								onPress={handleCloseModal}
								disabled={isSending}
							>
								<Text style={styles.modalButtonText}>Close</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.sendButton,
									isSending && styles.sendButtonDisabled,
								]}
								onPress={handleSendReply}
								disabled={isSending}
							>
								{isSending ? (
									<ActivityIndicator color={COLORS.background} />
								) : (
									<Text style={styles.modalButtonText}>Send</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	item: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	unread: {
		backgroundColor: COLORS.unreadBackground,
	},
	read: {
		backgroundColor: COLORS.readBackground,
	},
	messageContent: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
	},
	messageText: {
		fontSize: 16,
		color: COLORS.textPrimary,
		flexShrink: 1,
	},
	bidAmount: {
		fontWeight: 'bold',
		color: COLORS.accentGreen,
		marginLeft: 5,
		fontSize: 16,
	},
	timeText: {
		fontSize: 10,
		color: COLORS.textSecondary,
		marginLeft: 10,
		alignSelf: 'flex-start',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		color: COLORS.textSecondary,
		fontSize: 16,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
	modalContent: {
		width: '90%',
		backgroundColor: COLORS.card,
		borderRadius: 10,
		padding: 20,
		alignItems: 'stretch',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 15,
	},
	modalInput: {
		backgroundColor: COLORS.background,
		color: COLORS.textPrimary,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: COLORS.border,
		padding: 10,
		minHeight: 100,
		textAlignVertical: 'top',
		marginBottom: 20,
		fontSize: 16,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	modalButton: {
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		flex: 1,
		alignItems: 'center',
	},
	closeButton: {
		backgroundColor: COLORS.textSecondary,
		marginRight: 10,
	},
	sendButton: {
		backgroundColor: COLORS.accentGreen,
		marginLeft: 10,
	},
	sendButtonDisabled: {
		backgroundColor: '#2b8a5a',
	},
	modalButtonText: {
		color: COLORS.background,
		fontWeight: 'bold',
		fontSize: 16,
	},
})
