import { useState } from 'react'
import {
	Alert,
	Button,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity, // ⭐️ 1. Додано TouchableOpacity
	View,
} from 'react-native'
const CATEGORIES_DATA = [
	{ name: 'HandyMan', icon: 'tools' },
	{ name: 'Electrician', icon: 'power-plug' },
	{ name: 'Construction Cleaning', icon: 'broom' },
	{ name: 'Painter', icon: 'format-paint' },
	{ name: 'Home Cleaning', icon: 'vacuum' },
	{ name: 'Gardening', icon: 'flower-tulip' },
	{ name: 'Flooring', icon: 'layers-outline' },
	{ name: 'Air Condition technician', icon: 'air-conditioner' },
]
// ⭐️ 2. Визначимо список категорій
const CATEGORIES = CATEGORIES_DATA.map(item => item.name)

export default function CreateTaskModal({ visible, onClose, onSubmit }) {
	// 3. Стани для кожного поля форми
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('General') // "General" - за замовчуванням
	const [payment, setPayment] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// 4. Функція відправки
	const handleSubmit = async () => {
		// ... (Валідація без змін)
		if (!title.trim() || !description.trim() || !payment.trim()) {
			Alert.alert('Error', 'Please fill in all fields.')
			return
		}
		const paymentNumber = parseFloat(payment)
		if (isNaN(paymentNumber) || paymentNumber < 0) {
			Alert.alert('Error', 'Please enter a valid payment amount.')
			return
		}

		setIsSubmitting(true)
		try {
			// 5. Збираємо дані (включаючи обрану категорію)
			await onSubmit({
				title,
				description,
				category, // 'category' тепер береться зі стану
				payment: paymentNumber,
			})

			// 6. Очищення форми та закриття
			handleClose() // Використовуємо handleClose для очищення
		} catch (error) {
			console.error('Modal submission error:', error)
			Alert.alert('Error', 'Failed to create task. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	// 7. Функція закриття
	const handleClose = () => {
		// Очищуємо форму при закритті
		setTitle('')
		setDescription('')
		setCategory('General') // Скидаємо на "General"
		setPayment('')
		onClose() // Викликаємо функцію закриття з props
	}

	return (
		<Modal
			visible={visible}
			animationType='slide'
			transparent={true}
			onRequestClose={handleClose}
		>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContainer}>
					<ScrollView>
						<Text style={styles.modalTitle}>Create a Detailed Task</Text>

						<Text style={styles.label}>Title</Text>
						<TextInput
							style={styles.input}
							value={title}
							onChangeText={setTitle}
							placeholder='e.g., Mow the lawn'
							placeholderTextColor='#999'
						/>

						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder='Describe the task in detail...'
							placeholderTextColor='#999'
							multiline={true}
							numberOfLines={4}
						/>

						{/* ⭐️ 8. ЗАМІНЕНО TextInput НА БЛОК КНОПОК */}
						<Text style={styles.label}>Category</Text>
						<View style={styles.categoryContainer}>
							{CATEGORIES.map(cat => (
								<TouchableOpacity
									key={cat}
									// Застосовуємо активний стиль, якщо стан 'category' == 'cat'
									style={[
										styles.categoryButton,
										category === cat && styles.categoryButtonActive,
									]}
									onPress={() => setCategory(cat)} // Встановлюємо категорію при натисканні
								>
									<Text
										style={[
											styles.categoryButtonText,
											category === cat && styles.categoryButtonTextActive,
										]}
									>
										{cat}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						{/* ⭐️ КІНЕЦЬ БЛОКУ КНОПОК */}

						<Text style={styles.label}>Payment ($)</Text>
						<TextInput
							style={styles.input}
							value={payment}
							onChangeText={setPayment}
							placeholder='50'
							placeholderTextColor='#999'
							keyboardType='numeric'
						/>

						<View style={styles.modalButtonContainer}>
							<Button title='Cancel' onPress={handleClose} color='#FF3B30' />
							<Button
								title={isSubmitting ? 'Creating...' : 'Create Task'}
								onPress={handleSubmit}
								disabled={isSubmitting}
							/>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	)
}

// 9. Оновлені стилі
const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '90%',
		maxHeight: '80%',
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
		marginTop: 10,
	},
	input: {
		height: 50,
		borderColor: '#E5E7EB',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: '#F9FAFB',
		marginBottom: 16,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
		paddingTop: 15,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 20,
	},

	// ⭐️ 10. НОВІ СТИЛІ ДЛЯ КНОПОК КАТЕГОРІЙ
	categoryContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap', // Дозволяє кнопкам переноситись на новий рядок
		marginBottom: 16,
	},
	categoryButton: {
		backgroundColor: '#F3F4F6',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20, // Округлі кнопки
		marginRight: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	categoryButtonActive: {
		backgroundColor: '#007AFF', // Активний колір (синій)
		borderColor: '#007AFF',
	},
	categoryButtonText: {
		fontSize: 14,
		color: '#374151',
		fontWeight: '600',
	},
	categoryButtonTextActive: {
		color: '#FFFFFF', // Білий текст на активній кнопці
	},
})
