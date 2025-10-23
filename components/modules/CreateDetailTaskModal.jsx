import { useState } from 'react'
import {
	Alert,
	Button,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { CATEGORIES_DATA } from '../../utils/CategoriesData'
const CATEGORIES = CATEGORIES_DATA.map(item => item.name)

export default function CreateTaskModal({ visible, onClose, onSubmit }) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('General')
	const [payment, setPayment] = useState('')
	// ⭐️ 1. Додаємо нові стани для локації та адреси
	const [locationName, setLocationName] = useState('')
	const [address, setAddress] = useState('')

	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async () => {
		// Оновлена валідація (робимо основні поля обов'язковими)
		if (!title.trim() || !description.trim() || !payment.trim()) {
			Alert.alert('Error', 'Please fill in Title, Description, and Payment.')
			return
		}
		const paymentNumber = parseFloat(payment)
		if (isNaN(paymentNumber) || paymentNumber < 0) {
			Alert.alert('Error', 'Please enter a valid payment amount.')
			return
		}
		try {
			// ⭐️ 2. Збираємо всі дані, включаючи 'locationName' та 'address'
			await onSubmit({
				title,
				description,
				category,
				payment: paymentNumber,
				location: locationName.trim(), // Передаємо нові дані
				address: address.trim(), // Передаємо нові дані
			})

			handleClose() // Очищуємо форму при успіху
		} catch (error) {
			console.error('Modal submission error:', error)
			Alert.alert('Error', 'Failed to create task. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		// ⭐️ 3. Очищуємо всі поля при закритті
		setTitle('')
		setDescription('')
		setCategory('General')
		setPayment('')
		setLocationName('') // Очищуємо локацію
		setAddress('') // Очищуємо адресу
		onClose()
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
							placeholder='Some Title'
							placeholderTextColor='#999'
						/>

						{/* Description */}
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

						<Text style={styles.label}>Category</Text>
						<View style={styles.categoryContainer}>
							{CATEGORIES.map(cat => (
								<TouchableOpacity
									key={cat}
									style={[
										styles.categoryButton,
										category === cat && styles.categoryButtonActive,
									]}
									onPress={() => setCategory(cat)}
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

						{/* Payment */}
						<Text style={styles.label}>Payment ($)</Text>
						<TextInput
							style={styles.input}
							value={payment}
							onChangeText={setPayment}
							placeholder='50'
							placeholderTextColor='#999'
							keyboardType='numeric'
						/>

						<Text style={styles.label}>Location</Text>
						<TextInput
							style={styles.input}
							value={locationName}
							onChangeText={setLocationName}
							placeholder='Task location'
							placeholderTextColor='#999'
						/>

						<Text style={styles.label}>Full Address (Optional)</Text>
						<TextInput
							style={styles.input}
							value={address}
							onChangeText={setAddress}
							placeholder='Task address'
							placeholderTextColor='#999'
						/>
						{/* ⭐️ КІНЕЦЬ НОВИХ ПОЛІВ */}

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

// Стилі (без змін, крім додавання * до label)
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
	categoryContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 16,
	},
	categoryButton: {
		backgroundColor: '#F3F4F6',
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		marginRight: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	categoryButtonActive: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	categoryButtonText: {
		fontSize: 14,
		color: '#374151',
		fontWeight: '600',
	},
	categoryButtonTextActive: {
		color: '#FFFFFF',
	},
})
