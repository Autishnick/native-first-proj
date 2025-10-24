// File: components/modules/PasswordChangeSection.jsx
import { useState } from 'react'
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

import { COLORS } from '../../constants/colors'

export default function PasswordChangeSection({ onChangePassword, onCancel }) {
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [passwordError, setPasswordError] = useState('')

	const handlePasswordChange = async () => {
		setPasswordError('')
		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordError('Please fill in all password fields.')
			return
		}
		if (newPassword !== confirmPassword) {
			setPasswordError('New passwords do not match.')
			return
		}
		if (newPassword.length < 6) {
			setPasswordError('New password must be at least 6 characters long.')
			return
		}

		setIsChangingPassword(true)
		try {
			// Викликаємо функцію, передану через пропси
			await onChangePassword(currentPassword, newPassword)
			// Очистка та закриття обробляється в батьківському компоненті (AccountScreen)
		} catch (error) {
			setPasswordError(error.message)
		} finally {
			setIsChangingPassword(false)
		}
	}

	return (
		<View style={styles.passwordFormContainer}>
			<TextInput
				style={styles.formInput}
				placeholder='Current Password'
				placeholderTextColor={COLORS.textSecondary}
				secureTextEntry
				value={currentPassword}
				onChangeText={setCurrentPassword}
			/>
			<TextInput
				style={styles.formInput}
				placeholder='New Password'
				placeholderTextColor={COLORS.textSecondary}
				secureTextEntry
				value={newPassword}
				onChangeText={setNewPassword}
			/>
			<TextInput
				style={styles.formInput}
				placeholder='Confirm New Password'
				placeholderTextColor={COLORS.textSecondary}
				secureTextEntry
				value={confirmPassword}
				onChangeText={setConfirmPassword}
			/>
			{passwordError ? (
				<Text style={styles.errorText}>{passwordError}</Text>
			) : null}
			<TouchableOpacity
				style={styles.savePasswordButton}
				onPress={handlePasswordChange}
				disabled={isChangingPassword}
			>
				{isChangingPassword ? (
					<ActivityIndicator color='#FFFFFF' />
				) : (
					<Text style={styles.saveButtonText}>Save New Password</Text>
				)}
			</TouchableOpacity>
			{/* Кнопка Cancel викликає функцію onCancel з AccountScreen */}
			<TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
				<Text style={styles.cancelButtonText}>Cancel</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	passwordFormContainer: {
		marginTop: 20,
		backgroundColor: COLORS.card,
		borderRadius: 10,
		padding: 15,
	},
	formInput: {
		width: '100%',
		backgroundColor: COLORS.background,
		color: COLORS.textPrimary,
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
		fontSize: 16,
	},
	savePasswordButton: {
		width: '100%',
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 5,
	},
	saveButtonText: {
		color: '#FFFFFF', // Використовуємо білий для кращого контрасту
		fontSize: 18,
		fontWeight: 'bold',
	},
	cancelButton: {
		width: '100%',
		backgroundColor: '#4A5568', // Сірий колір для Cancel
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	cancelButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
	errorText: {
		color: COLORS.accentRed,
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 10,
	},
})
