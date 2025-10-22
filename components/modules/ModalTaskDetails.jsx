import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

export default function CustomModal({
	visible,
	onClose,
	title = 'Task details',
	tasks = [],
	searchQuery = '',
}) {
	const initialBidPrice = '0'

	const [editing, setEditing] = useState(false)
	// Стан для фактичної поточної ставки (початкове '0')
	const [bidPrice, setBidPrice] = useState(initialBidPrice)
	// Стан для тимчасової ставки під час редагування (для функції 'Cancel')
	const [tempBidPrice, setTempBidPrice] = useState(initialBidPrice)

	const handleBidPriceChange = text => {
		// Регулярний вираз дозволяє лише цифри (0-9)
		const newText = text.replace(/[^0-9]/g, '')
		setTempBidPrice(newText)
	}

	const handleEdit = () => {
		if (!editing) {
			setTempBidPrice(bidPrice)
		}
		setEditing(true)
	}

	// Функція для 'Save'
	const handleSave = () => {
		const finalPrice = tempBidPrice === '' ? '0' : tempBidPrice
		setBidPrice(finalPrice)
		setEditing(false)
	}

	// Функція для 'Cancel'
	const handleCancel = () => {
		// Відновлюємо tempBidPrice до поточного bidPrice і виходимо з режиму редагування
		setTempBidPrice(bidPrice)
		setEditing(false)
	}

	const handleSubmitBid = () => {
		setEditing(false)
		alert(`Bid submitted: $${bidPrice}`)
	}

	// Визначаємо, чи потрібно відображати секцію ставки (завжди, незалежно від task)
	// Якщо ви хочете, щоб секція відображалася завжди: const showBidSection = true
	const showBidSection = true // Змінено на завжди true для простоти, оскільки ми прибрали mainTask логіку

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

							return (
								<View key={task.id} style={styles.taskContainer}>
									{task.title && <Text style={styles.title}>{task.title}</Text>}
									{task.createdBy && (
										<Text style={styles.description}>
											Created by: {task.createdBy}
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
							<TouchableOpacity style={styles.editButton} onPress={handleEdit}>
								<Ionicons name='pencil' size={18} color='#000' />
								<Text style={styles.editText}>Edit</Text>
							</TouchableOpacity>
						</View>

						{editing ? (
							<>
								<TextInput
									style={styles.input}
									keyboardType='numeric'
									// Використовуємо handleBidPriceChange для валідації
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

						{/* Кнопка "Submit Bid" */}
						<TouchableOpacity
							style={styles.submitButton}
							onPress={handleSubmitBid}
						>
							<Text style={styles.submitText}>Submit Bid</Text>
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
		paddingVertical: 14,
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
		backgroundColor: '#16aa56ff', // Зелений, як submit
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
		backgroundColor: '#A9A9A9', // Середній сірий
		paddingVertical: 10,
		borderRadius: 10,
		alignItems: 'center',
		marginLeft: 8,
	},
	cancelText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff', // Білий текст для контрасту
	},
})
