import { Ionicons } from '@expo/vector-icons'
import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from 'firebase/firestore'
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
import { useAuth } from '../../hooks/useAuth'
import { useTasks } from '../../hooks/useTasks'
import { db } from '../../src/firebase/config'
import { createNotification } from '../../utils/firebaseUtils'
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

	// 🔹 Якщо користувач — адмін, вантажимо список відгуків (bids)
	// 🔹 Якщо користувач — адмін, вантажимо список відгуків (bids)
	useEffect(() => {
		// ✅ Make sure userId is available before querying
		if (!isWorker && tasks.length > 0 && userId) {
			const fetchBids = async () => {
				try {
					const task = tasks[0]

					// ✅ UPDATE THIS QUERY
					const q = query(
						collection(db, 'notifications'),
						where('taskId', '==', task.id),
						where('recipientId', '==', userId) // 👈 ADD THIS LINE
					)

					const snapshot = await getDocs(q)
					const bidList = snapshot.docs
						.map(doc => doc.data())
						.filter(n => n.type === 'new_bid')
					setBidders(bidList)
				} catch (error) {
					console.error('Error fetching bids:', error)
				}
			}
			fetchBids()
		}
	}, [isWorker, tasks, userId]) // ✅ Add userId as a dependency

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

	// 🔹 Воркер надсилає ставку
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
				message: ` made a new bid on "${task.title}"`,
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
			Alert.alert('Error', 'Failed to submit bid. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	// 🔹 Основний контент
	return (
		<Modal
			animationType='slide'
			transparent={false}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.fullScreenContainer}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onClose} style={styles.backButton}>
						<Ionicons name='arrow-back' size={26} color='#0B1A2A' />
					</TouchableOpacity>
					<Text style={styles.headerText}>Task details</Text>
				</View>

				{/* Основний контент */}
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
								<Ionicons name='pencil' size={18} color='#000' />
								<Text style={styles.editText}>Edit</Text>
							</TouchableOpacity>
						</View>

						{editing ? (
							<View>
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
							</View>
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
					/* 🔹 Для адміна — список відгуків */
					// ✅ CORRECTED CODE

					<View style={styles.bidSection}>
						<Text style={styles.bidLabel}>Workers who applied:</Text>
						{bidders && bidders.length > 0 ? (
							bidders.map((bid, i) => (
								<View key={i} style={styles.bidderCard}>
									<Text style={styles.bidderText}>
										💼 {bid.senderName} — ${bid.bidAmount}
									</Text>
								</View>
							))
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
	fullScreenContainer: { flex: 1, backgroundColor: '#F9FAFB' },
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 50,
		paddingBottom: 20,
		paddingHorizontal: 16,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		elevation: 3,
	},
	backButton: { marginRight: 12 },
	headerText: { fontSize: 18, fontWeight: '600', color: '#0B1A2A' },
	scrollContainer: { padding: 16, paddingBottom: 140 },
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
	description: { marginTop: 10, color: '#333', lineHeight: 22, fontSize: 16 },
	title: { marginBottom: 10, fontSize: 24, fontWeight: 'bold', color: '#000' },
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
		marginBottom: 10,
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	editText: { marginLeft: 5, color: '#000', fontWeight: '500' },
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
	},
	submitButtonDisabled: { backgroundColor: '#0a7d3e', opacity: 0.6 },
	submitText: { fontSize: 18, fontWeight: '600', color: '#000' },
	controlButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	saveButton: {
		flex: 1,
		backgroundColor: '#16aa56ff',
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginRight: 8,
	},
	saveText: { fontSize: 16, fontWeight: '600', color: '#000' },
	cancelButton: {
		flex: 1,
		backgroundColor: '#A9A9A9',
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginLeft: 8,
	},
	cancelText: { fontSize: 16, fontWeight: '600', color: '#fff' },
	bidderCard: {
		backgroundColor: '#fff',
		padding: 12,
		borderRadius: 10,
		marginBottom: 10,
	},
	bidderText: { fontSize: 16, color: '#000' },
	noBidsText: { color: '#aaa', fontStyle: 'italic', marginTop: 10 },
})
