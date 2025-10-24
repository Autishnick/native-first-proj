// File: components/modules/CreateTaskModal.jsx
import { useState } from 'react'
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { CATEGORIES_DATA } from '../../constants/CategoriesData'
import { COLORS } from '../../constants/colors'
import CategorySelector from '../ui/CategorySelector' // Імпорт
import FormField from '../ui/FormField' // Імпорт

const CATEGORIES = CATEGORIES_DATA.map(item => item.name)

export default function CreateTaskModal({ visible, onClose, onSubmit }) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [category, setCategory] = useState('General')
	const [payment, setPayment] = useState('')
	const [locationName, setLocationName] = useState('')
	const [address, setAddress] = useState('')

	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async () => {
		if (!title.trim() || !description.trim() || !payment.trim()) {
			Alert.alert('Error', 'Please fill in Title, Description, and Payment.')
			return
		}
		const paymentNumber = parseFloat(payment)
		if (isNaN(paymentNumber) || paymentNumber < 0) {
			Alert.alert('Error', 'Please enter a valid payment amount.')
			return
		}

		setIsSubmitting(true)
		try {
			await onSubmit({
				title,
				description,
				category,
				payment: paymentNumber,
				location: locationName.trim(),
				address: address.trim(),
			})
			handleClose() // Закриваємо тільки після успішної відправки
		} catch (error) {
			console.error('Modal submission error:', error)
			Alert.alert('Error', 'Failed to create task. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		// Очистка полів
		setTitle('')
		setDescription('')
		setCategory('General')
		setPayment('')
		setLocationName('')
		setAddress('')
		setIsSubmitting(false) // Скидаємо стан відправки
		onClose() // Викликаємо функцію закриття з пропсів
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
					<ScrollView contentContainerStyle={styles.scrollContent}>
						<Text style={styles.modalTitle}>Create a Detailed Task</Text>

						<FormField
							label='Title'
							value={title}
							onChangeText={setTitle}
							placeholder='Task Title'
						/>

						<FormField
							label='Description'
							value={description}
							onChangeText={setDescription}
							placeholder='Describe the task in detail...'
							multiline={true}
							numberOfLines={4}
							style={styles.textArea} // Передаємо додатковий стиль
						/>

						<Text style={styles.label}>Category</Text>
						<CategorySelector
							categories={CATEGORIES}
							selectedCategory={category}
							onSelectCategory={setCategory}
						/>

						<FormField
							label='Payment ($)'
							value={payment}
							onChangeText={setPayment}
							placeholder='50'
							keyboardType='numeric'
						/>

						<FormField
							label='Location Name'
							value={locationName}
							onChangeText={setLocationName}
							placeholder='e.g., Downtown Lviv'
						/>

						<FormField
							label='Full Address (Optional)'
							value={address}
							onChangeText={setAddress}
							placeholder='Street, Building, Apartment'
						/>

						<View style={styles.modalButtonContainer}>
							<TouchableOpacity
								style={[styles.actionButton, styles.cancelButton]}
								onPress={handleClose}
								disabled={isSubmitting}
							>
								<Text style={styles.cancelButtonText}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.actionButton, styles.submitButton]}
								onPress={handleSubmit}
								disabled={isSubmitting}
							>
								<Text style={styles.submitButtonText}>
									{isSubmitting ? 'Creating...' : 'Create Task'}
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '90%',
		maxHeight: '80%',
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 6,
		elevation: 5,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
		color: COLORS.textPrimary,
	},
	// Стилі label та input тепер у FormField, але textArea залишається
	label: {
		// Стиль для заголовка 'Category'
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 8,
	},
	textArea: {
		height: 100,
		textAlignVertical: 'top',
		paddingTop: 15,
	},
	modalButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		marginHorizontal: 5,
	},
	cancelButton: {
		backgroundColor: COLORS.accentRed,
	},
	cancelButtonText: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: 'bold',
	},
	submitButton: {
		backgroundColor: COLORS.accentGreen,
	},
	submitButtonText: {
		color: COLORS.buttonTextDark,
		fontSize: 16,
		fontWeight: 'bold',
	},
	// Стилі для CategorySelector тепер знаходяться всередині компонента
})
