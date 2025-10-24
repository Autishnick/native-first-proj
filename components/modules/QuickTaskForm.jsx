// File: components/modules/QuickTaskForm.jsx
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'

export default function QuickTaskForm({ onSubmit }) {
	const [text, setText] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleCreateTask = async () => {
		if (!text.trim()) {
			Alert.alert('Error', 'Please describe what you need done.')
			return
		}

		setIsSubmitting(true)
		try {
			// Pass the title back to the parent component for submission
			await onSubmit(text)
			setText('') // Clear input on success
		} catch (error) {
			// Error handling might be done in the parent, or display a generic message here
			Alert.alert('Error', 'Failed to post quick task.')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View style={styles.quickTaskForm}>
			<TextInput
				style={styles.input}
				placeholder='What do you need done?'
				placeholderTextColor={COLORS.textSecondary}
				onChangeText={setText}
				value={text}
				editable={!isSubmitting}
				color={COLORS.textPrimary}
			/>
			<TouchableOpacity
				style={[styles.quickButton, isSubmitting && styles.quickButtonDisabled]}
				onPress={handleCreateTask}
				disabled={isSubmitting || !text.trim()} // Disable if empty or submitting
			>
				{isSubmitting ? (
					<ActivityIndicator color={COLORS.buttonTextDark} />
				) : (
					<Text style={styles.quickButtonText}>Post Task</Text>
				)}
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	quickTaskForm: {
		width: '100%',
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
		marginBottom: 20, // Add margin if needed
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: COLORS.background,
		marginBottom: 16,
		color: COLORS.textPrimary, // Ensure text color is set
	},
	quickButton: {
		backgroundColor: COLORS.accentGreen,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: 'center',
		width: '100%',
	},
	quickButtonDisabled: {
		backgroundColor: COLORS.border,
		opacity: 0.7,
	},
	quickButtonText: {
		color: COLORS.buttonTextDark,
		fontSize: 16,
		fontWeight: 'bold',
	},
})
