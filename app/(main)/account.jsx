// File: app/(main)/account.jsx (або ваш шлях)
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import PasswordChangeSection from '../../components/modules/PasswordChangeSection' // Імпорт
import PersonalInfoSection from '../../components/modules/PersonalInfoSection' // Імпорт
import { useAuth } from '../../hooks/useAuth'

const COLORS = {
	// Залишаємо кольори, потрібні для цього екрана
	background: '#0B1A2A',
	textPrimary: '#FFFFFF',
	textSecondary: '#A0B3C9',
	accentGreen: '#2ECC71',
	link: '#2ECC71',
	actionButtonBg: '#1C3B5A',
}

export default function AccountScreen() {
	const { user, profile, loading, updateUserProfile, changeUserPassword } =
		useAuth()
	const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
		useState(false)

	// Функція для PasswordChangeSection
	const handlePasswordChangeSubmit = async (currentPassword, newPassword) => {
		try {
			await changeUserPassword(currentPassword, newPassword)
			Alert.alert('Success', 'Your password has been changed successfully.')
			setIsPasswordSectionVisible(false) // Закриваємо секцію
		} catch (error) {
			// Помилка обробляється всередині PasswordChangeSection,
			// але ми можемо перекинути її, якщо потрібно
			throw error
		}
	}

	const togglePasswordSection = () => {
		setIsPasswordSectionVisible(!isPasswordSectionVisible)
	}

	// Стани завантаження та "не залогінений"
	if (loading) {
		return (
			<View style={[styles.mainContainer, styles.centered]}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (!user) {
		// Логіка для незалогіненого користувача (можна винести в NotLoggedInPlaceholder)
		return (
			<View style={[styles.mainContainer, styles.centered, { padding: 25 }]}>
				<Text style={styles.title}>My Account</Text>
				<Text style={styles.subtitle}>
					You need to login to view your account details
				</Text>
				<TouchableOpacity
					style={styles.loginButton}
					onPress={() => router.replace('/(auth)/login')} // Використовуємо replace
				>
					<Text style={styles.loginButtonText}>Log In</Text>
				</TouchableOpacity>
				<View style={styles.linkContainer}>
					<Text style={styles.subtitle}>Don't have an account? </Text>
					<TouchableOpacity onPress={() => router.push('/(auth)/register')}>
						<Text style={styles.link}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	// Рендер основного екрана
	return (
		<View style={styles.mainContainer}>
			<ScrollView style={styles.scrollContainer}>
				{/* Використовуємо винесені компоненти */}
				<PersonalInfoSection
					user={user}
					profile={profile}
					updateUserProfile={updateUserProfile}
				/>

				{/* Секція Безпеки */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account Security</Text>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={togglePasswordSection}
					>
						<Text style={styles.actionButtonText}>
							{isPasswordSectionVisible
								? 'Hide Password Section'
								: 'Change Password'}
						</Text>
					</TouchableOpacity>
					{isPasswordSectionVisible && (
						<PasswordChangeSection
							onChangePassword={handlePasswordChangeSubmit}
							onCancel={togglePasswordSection} // Передаємо функцію для закриття
						/>
					)}
				</View>

				{/* Тут можна додати інші секції, наприклад, "Налаштування сповіщень" */}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scrollContainer: {
		paddingHorizontal: 20,
		paddingTop: 30,
		paddingBottom: 50, // Додано відступ знизу
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 5,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: 20,
	},
	section: {
		marginBottom: 30,
	}, // Стилі для section тепер в дочірніх компонентах
	sectionTitle: {
		// Залишаємо стиль для заголовка секції безпеки
		fontSize: 20,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 15,
	},
	loginButton: {
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 30,
		width: '100%',
	},
	loginButtonText: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: 'bold',
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	link: {
		color: COLORS.link,
		fontWeight: 'bold',
		fontSize: 16, // Зроблено однакового розміру з subtitle
	},
	actionButton: {
		backgroundColor: COLORS.actionButtonBg,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 15,
	},
	actionButtonText: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '500',
	},
})
