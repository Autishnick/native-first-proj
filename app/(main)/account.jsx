import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'

const InfoRow = ({ label, value, isEditing, onChangeText, isLast }) => (
	<View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
		<Text style={styles.infoLabel}>{label}</Text>
		{isEditing ? (
			<TextInput
				style={styles.infoInput}
				value={value}
				onChangeText={onChangeText}
				autoCapitalize='words'
			/>
		) : (
			<Text style={styles.infoValue}>{value}</Text>
		)}
	</View>
)

export default function AccountScreen() {
	// `logout` більше не потрібен тут, він використовується в AppHeader
	const { user, profile, loading, updateUserProfile, changeUserPassword } =
		useAuth()

	// Стан для режиму редагування
	const [isEditMode, setIsEditMode] = useState(false)
	const [displayName, setDisplayName] = useState('')

	// Стан для секції зміни пароля
	const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
		useState(false)
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [isChangingPassword, setIsChangingPassword] = useState(false)
	const [passwordError, setPasswordError] = useState('')

	useEffect(() => {
		if (profile) {
			setDisplayName(profile.displayName || '')
		}
	}, [profile])

	// handleLogout тепер знаходиться в компоненті AppHeader

	// Логіка редагування профілю (без змін)
	const handleEditToggle = () => {
		setIsEditMode(!isEditMode)
		if (isEditMode) {
			setDisplayName(profile.displayName || '')
		}
	}

	const handleSaveChanges = async () => {
		if (displayName.trim() === '') {
			Alert.alert('Error', 'Name cannot be empty.')
			return
		}
		try {
			await updateUserProfile({ displayName: displayName.trim() })
			Alert.alert('Success', 'Your profile has been updated.')
			setIsEditMode(false)
		} catch (error) {
			Alert.alert('Error', error.message)
		}
	}

	// Логіка для показу/приховування секції пароля (без змін)
	const togglePasswordSection = () => {
		const nextState = !isPasswordSectionVisible
		setIsPasswordSectionVisible(nextState)
		if (!nextState) {
			setCurrentPassword('')
			setNewPassword('')
			setConfirmPassword('')
			setPasswordError('')
		}
	}

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
			await changeUserPassword(currentPassword, newPassword)
			Alert.alert('Success', 'Your password has been changed successfully.')
			togglePasswordSection()
		} catch (error) {
			setPasswordError(error.message)
		} finally {
			setIsChangingPassword(false)
		}
	}

	// Допоміжні функції форматування (без змін)
	const formatRole = role => {
		if (!role) return 'N/A'
		return role.charAt(0).toUpperCase() + role.slice(1)
	}
	const formatDate = isoString => {
		if (!isoString) return 'N/A'
		try {
			return new Date(isoString).toLocaleDateString('en-US')
		} catch (e) {
			return 'Invalid Date'
		}
	}

	// Стани завантаження та "не залогінений" (без змін)
	if (loading) {
		return (
			<View style={[styles.mainContainer, styles.centered]}>
				<ActivityIndicator size='large' color='#2ECC71' />
			</View>
		)
	}
	if (!user) {
		return (
			<View style={[styles.mainContainer, styles.centered, { padding: 25 }]}>
				<Text style={styles.title}>My Account</Text>
				<Text style={styles.subtitle}>
					You need to login to view your account details
				</Text>
				<TouchableOpacity
					style={styles.loginButton}
					onPress={() => router.push('/login')}
				>
					<Text style={styles.loginButtonText}>Log In</Text>
				</TouchableOpacity>
				<View style={styles.linkContainer}>
					<Text style={styles.subtitle}>Don't have an account? </Text>
					<TouchableOpacity onPress={() => router.push('/register')}>
						<Text style={styles.link}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.mainContainer}>
			<ScrollView style={styles.scrollContainer}>
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Personal Information</Text>
						<TouchableOpacity
							style={styles.editButton}
							onPress={handleEditToggle}
						>
							<Text style={styles.editButtonText}>
								{isEditMode ? 'Cancel' : 'Edit'}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.infoBox}>
						<InfoRow
							label='Name'
							value={displayName}
							isEditing={isEditMode}
							onChangeText={setDisplayName}
						/>
						<InfoRow label='Email' value={user?.email || 'N/A'} />
						<InfoRow label='User Type' value={formatRole(profile?.role)} />
						<InfoRow
							label='Member Since'
							value={formatDate(profile?.createdAt)}
							isLast={true}
						/>
					</View>
					{isEditMode && (
						<TouchableOpacity
							style={styles.saveButton}
							onPress={handleSaveChanges}
						>
							<Text style={styles.saveButtonText}>Save Changes</Text>
						</TouchableOpacity>
					)}
				</View>

				{/* Секція Безпеки */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account Security</Text>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={togglePasswordSection}
					>
						<Text style={styles.actionButtonText}>
							{isPasswordSectionVisible ? 'Cancel' : 'Change Password'}
						</Text>
					</TouchableOpacity>
					{isPasswordSectionVisible && (
						<View style={styles.passwordFormContainer}>
							<TextInput
								style={styles.formInput}
								placeholder='Current Password'
								placeholderTextColor='#888'
								secureTextEntry
								value={currentPassword}
								onChangeText={setCurrentPassword}
							/>
							<TextInput
								style={styles.formInput}
								placeholder='New Password'
								placeholderTextColor='#888'
								secureTextEntry
								value={newPassword}
								onChangeText={setNewPassword}
							/>
							<TextInput
								style={styles.formInput}
								placeholder='Confirm New Password'
								placeholderTextColor='#888'
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
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	)
}

// Стилі основного компонента
const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: '#0B1A2A',
	},
	scrollContainer: {
		paddingHorizontal: 20,
		paddingTop: 30,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#FFFFFF',
		marginBottom: 5,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: '#A0B3C9',
		textAlign: 'center',
		marginBottom: 20,
	},
	section: { marginBottom: 30 },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	sectionTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
	editButton: {
		borderWidth: 1,
		borderColor: '#4A90E2',
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
	},
	editButtonText: { fontSize: 14, color: '#4A90E2', fontWeight: '500' },
	infoBox: {
		backgroundColor: '#122B46',
		borderRadius: 10,
		borderColor: '#2ECC71',
		borderWidth: 1,
	},
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 18,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#1C3B5A',
	},
	lastInfoRow: { borderBottomWidth: 0 },
	infoLabel: { fontSize: 16, color: '#A0B3C9' },
	infoValue: { fontSize: 16, fontWeight: '600', color: '#2ECC71' },
	loginButton: {
		backgroundColor: '#2ECC71',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 30,
		width: '100%',
	},
	loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	link: { color: '#2ECC71', fontWeight: 'bold' },
	infoInput: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
		textAlign: 'right',
		flex: 1,
		marginLeft: 10,
	},
	saveButton: {
		backgroundColor: '#2ECC71',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
	actionButton: {
		backgroundColor: '#1C3B5A',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 15,
	},
	actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
	passwordFormContainer: {
		marginTop: 20,
		backgroundColor: '#122B46',
		borderRadius: 10,
		padding: 15,
	},
	formInput: {
		width: '100%',
		backgroundColor: '#0B1A2A',
		color: '#FFFFFF',
		padding: 12,
		borderRadius: 8,
		marginBottom: 15,
		fontSize: 16,
	},
	savePasswordButton: {
		width: '100%',
		backgroundColor: '#2ECC71',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 5,
	},
	errorText: {
		color: '#FF6B6B',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 10,
	},
})
