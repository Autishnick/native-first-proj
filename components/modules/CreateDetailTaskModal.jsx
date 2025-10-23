import { useState } from 'react'
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
import { CATEGORIES_DATA } from '../../utils/CategoriesData'

const CATEGORIES = CATEGORIES_DATA.map(item => item.name)

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	accentRed: '#F56565',
	buttonTextDark: '#1A202C',
	border: '#4A5568',
}

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

			handleClose()
		} catch (error) {
			console.error('Modal submission error:', error)
			Alert.alert('Error', 'Failed to create task. Please try again.')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		setTitle('')
		setDescription('')
		setCategory('General')
		setPayment('')
		setLocationName('')
		setAddress('')
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
					<ScrollView contentContainerStyle={styles.scrollContent}>
						<Text style={styles.modalTitle}>Create a Detailed Task</Text>

						<Text style={styles.label}>Title</Text>
						<TextInput
							style={styles.input}
							value={title}
							onChangeText={setTitle}
							placeholder='Some Title'
							placeholderTextColor={COLORS.textSecondary}
							color={COLORS.textPrimary}
						/>

						<Text style={styles.label}>Description</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder='Describe the task in detail...'
							placeholderTextColor={COLORS.textSecondary}
							multiline={true}
							numberOfLines={4}
							color={COLORS.textPrimary}
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

						<Text style={styles.label}>Payment ($)</Text>
						<TextInput
							style={styles.input}
							value={payment}
							onChangeText={setPayment}
							placeholder='50'
							placeholderTextColor={COLORS.textSecondary}
							keyboardType='numeric'
							color={COLORS.textPrimary}
						/>

						<Text style={styles.label}>Location</Text>
						<TextInput
							style={styles.input}
							value={locationName}
							onChangeText={setLocationName}
							placeholder='Task location'
							placeholderTextColor={COLORS.textSecondary}
							color={COLORS.textPrimary}
						/>

						<Text style={styles.label}>Full Address (Optional)</Text>
						<TextInput
							style={styles.input}
							value={address}
							onChangeText={setAddress}
							placeholder='Task address'
							placeholderTextColor={COLORS.textSecondary}
							color={COLORS.textPrimary}
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
		backgroundColor: COLORS.card, // Dark card background
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
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 8,
		marginTop: 10,
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: COLORS.background, // Very dark for input fields
		marginBottom: 16,
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
		backgroundColor: COLORS.accentRed, // Red for cancel
	},
	cancelButtonText: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: 'bold',
	},
	submitButton: {
		backgroundColor: COLORS.accentGreen, // Green accent for submit
	},
	submitButtonText: {
		color: COLORS.buttonTextDark, // Dark text on green
		fontSize: 16,
		fontWeight: 'bold',
	},
	categoryContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 16,
	},
	categoryButton: {
		backgroundColor: COLORS.background, // Dark background for inactive
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		marginRight: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	categoryButtonActive: {
		backgroundColor: COLORS.accentGreen, // Green accent for active
		borderColor: COLORS.accentGreen,
	},
	categoryButtonText: {
		fontSize: 14,
		color: COLORS.textSecondary, // Light gray for inactive text
		fontWeight: '600',
	},
	categoryButtonTextActive: {
		color: COLORS.buttonTextDark, // Dark text on green
	},
})
