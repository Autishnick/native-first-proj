import { Ionicons } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore' // getDoc залишається для нікнеймів
import { useEffect, useState } from 'react'
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
// ⭐️ ПОВЕРНУЛИ ІМПОРТИ
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../src/firebase/config'
import { createNotification } from '../../utils/firebaseUtils'

/**
 * Компонент модального вікна, який САМОСТІЙНО обробляє логіку ставки.
 */
export default function CustomModal({
	visible,
	onClose,
	tasks = [],
	// ⛔️ ВИДАЛЕНО: onSubmitBid
	searchQuery = '',
}) {
	// ⭐️ ПОВЕРНУЛИ: const { userId, userName } = useAuth()
	const { userId, userName } = useAuth()

	const initialBidPrice = '0'

	const [editing, setEditing] = useState(false)
	const [bidPrice, setBidPrice] = useState(initialBidPrice)
	const [tempBidPrice, setTempBidPrice] = useState(initialBidPrice)
	const [authorNicknames, setAuthorNicknames] = useState({})
	const [submitting, setSubmitting] = useState(false)

	// ... (useEffect для fetchAuthorNicknames залишається без змін) ...
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

	// ... (handleBidPriceChange, handleEdit, handleSave, handleCancel залишаються без змін) ...
	const handleBidPriceChange = text => {
		const newText = text.replace(/[^0-9]/g, '')
		setTempBidPrice(newText)
	}
	const handleEdit = () => {
		if (!editing) {
			setTempBidPrice(bidPrice)
		}
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

	// ⭐️ ПОВЕРНУЛИ ЛОГІКУ У handleSubmitBid
	const handleSubmitBid = async () => {
		// 1. Валідація
		if (bidPrice === '0' || bidPrice === '') {
			Alert.alert('Error', 'Please enter a valid bid amount')
			return
		}
		if (tasks.length === 0) {
			Alert.alert('Error', 'No task found')
			return
		}

		const task = tasks[0] // Беремо перший таск

		// Перевірка на ставку на власне завдання
		if (task.createdBy === userId) {
			Alert.alert('Error', 'You cannot place a bid on your own task.')
			return
		}

		setSubmitting(true)
		setEditing(false)

		try {
			// 2. ⭐️ Викликаємо createNotification напряму
			await createNotification({
				recipientId: task.createdBy,
				senderId: userId,
				senderName: userName || 'Anonymous',
				taskId: task.id,
				type: 'new_bid', // Переконайтеся, що ваш firebaseUtils очікує 'new_bid'
				message: ` made a new bid on "${task.title}"`,
				bidAmount: parseInt(bidPrice),
			})

			// 3. ⭐️ Повертаємо Alert та onClose
			Alert.alert('Success', `Bid of $${bidPrice} submitted successfully!`)

			// 4. Скидаємо стан
			setBidPrice(initialBidPrice)
			setTempBidPrice(initialBidPrice)

			// 5. Закриваємо модальне вікно
			onClose()
		} catch (error) {
			console.error('Error submitting bid:', error)
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	const showBidSection = true

	return (
		<Modal
			animationType='slide'
			transparent={false}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.fullScreenContainer}>
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.backButton}>
						<Ionicons name='arrow-back' size={26} color='#0B1A2A' />
					</TouchableOpacity>
					<Text style={styles.headerText}>Task details</Text>
				</View>

				<ScrollView contentContainerStyle={styles.scrollContainer}>
					{tasks.length > 0 ? (
						tasks.map(task => {
							let formattedDate = 'N/A'
							if (task.dueDate) {
								try {
									if (task.dueDate.seconds) {
										formattedDate = new Date(
											task.dueDate.seconds * 1000
										).toLocaleDateString()
									} else if (task.dueDate.toDate) {
										formattedDate = task.dueDate.toDate().toLocaleDateString()
									} else {
										formattedDate = new Date(task.dueDate).toLocaleDateString()
									}
								} catch (e) {
									console.warn('Invalid date format:', task.dueDate)
								}
							}

							const authorNickname =
								authorNicknames[task.createdBy] || 'Loading...'

							return (
								<View key={task.id} style={styles.taskContainer}>
									{task.title && <Text style={styles.title}>{task.title}</Text>}
									{task.createdBy && (
										<Text style={styles.description}>
											Created by: {authorNickname}
										</Text>
									)}
									{task.location && (
										<Text style={styles.description}>
											Location: {task.location}
										</Text>
									)}
									{task.dueDate && (
										<Text style={styles.description}>
											Target Date: {formattedDate}
										</Text>
									)}
									{task.payment && (
										<Text style={styles.description}>
											Original bid: {task.payment} USD
										</Text>
									)}
									{task.description && (
										<Text style={styles.description}>
											Description: {task.description}
										</Text>
									)}
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

				{showBidSection && (
					<View style={styles.bidSection}>
						<View style={styles.bidHeader}>
							<Text style={styles.bidLabel}>Your Bid Price</Text>
							<TouchableOpacity
								style={styles.editButton}
								onPress={handleEdit}
								disabled={submitting}
							>
								<Ionicons name='pencil' size={18} color='#000' />
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
							onPress={handleSubmitBid} // ⭐️ Викликає оновлену функцію
							disabled={submitting}
						>
							<Text style={styles.submitText}>
								{submitting ? 'Submitting...' : 'Submit Bid'}
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	fullScreenContainer: {
		flex: 1,
		backgroundColor: '#F9FAFB',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 50, // Збільшено для SafeArea (можливо)
		paddingBottom: 20,
		paddingHorizontal: 16,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		elevation: 3,
	},
	backButton: {
		marginRight: 12,
	},
	headerText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#0B1A2A',
	},
	scrollContainer: {
		padding: 16,
		paddingBottom: 140,
	},
	taskContainer: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	description: {
		marginTop: 15,
		color: '#4f4c4cff',
		lineHeight: 25,
		fontSize: 18,
	},
	title: {
		marginBottom: 10,
		fontSize: 24,
		color: '#070606ff',
		fontStyle: 'italic',
	},
	messageText: {
		textAlign: 'center',
		color: '#888',
		marginTop: 60,
		fontSize: 16,
	},
	bidSection: {
		backgroundColor: '#021526',
		padding: 16,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	bidHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	bidLabel: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	editText: {
		marginLeft: 5,
		color: '#000',
		fontWeight: '500',
	},
	bidValue: {
		fontSize: 30,
		color: '#1DFE79',
		fontWeight: '700',
		marginVertical: 10,
	},
	input: {
		fontSize: 30,
		color: '#1DFE79',
		fontWeight: '700',
		marginVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#1DFE79',
		paddingBottom: 5,
	},
	submitButton: {
		backgroundColor: '#1DFE79',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 10,
		shadowColor: '#1DFE79',
		shadowOpacity: 0.4,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 8,
	},
	submitButtonDisabled: {
		backgroundColor: '#0a7d3e',
		opacity: 0.6,
	},
	submitText: {
		fontSize: 18,
		fontWeight: '600',
		color: '#000',
	},
	controlButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
		marginBottom: 10,
	},
	saveButton: {
		flex: 1,
		backgroundColor: '#16aa56ff',
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginRight: 8,
	},
	saveText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
	},
	cancelButton: {
		flex: 1,
		backgroundColor: '#A9A9A9',
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginLeft: 8,
	},
	cancelText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
	},
})
