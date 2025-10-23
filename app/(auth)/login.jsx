import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import AppHeader from '../../components/modules/Header'
import { useAuth } from '../../hooks/useAuth'

// Define the color palette based on the example image
const COLORS = {
	background: '#1A202C', // Dark blue-gray background
	card: '#2D3748', // Slightly lighter dark for inputs/cards
	textPrimary: '#FFFFFF', // White text
	textSecondary: '#9CA3AF', // Light gray text
	accentGreen: '#34D399', // Bright green from "Complete" button
	buttonTextDark: '#1A202C', // Dark text for contrast on green button
	border: '#4A5568', // Subtle border for inputs
}

export default function LoginScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const { login } = useAuth()

	const handleLogin = async () => {
		console.log('=== LOGIN STARTED ===')
		console.log('Email:', email)

		if (!email || !password) {
			console.log('❌ Validation failed: Missing fields')
			Alert.alert('Error', 'Please enter email and password.')
			return
		}

		console.log('✅ Validation passed, calling login...')
		setIsLoading(true)
		try {
			// Call the login function from useAuth
			await login(email, password)
			console.log('✅ Login successful!')

			// Automatically navigate to the main screen
			router.replace('/(main)')
		} catch (error) {
			console.error('❌ Login failed:', error)
			console.error('Error message:', error.message)

			// Display a user-friendly error message
			Alert.alert('Login Failed', error.message || 'Invalid credentials.')
		} finally {
			setIsLoading(false)
			console.log('=== LOGIN ENDED ===')
		}
	}

	return (
		<>
			{/* Set status bar to light text for the dark background */}
			<StatusBar barStyle='light-content' />
			<AppHeader />
			<View style={styles.container}>
				<Text style={styles.header}>Welcome Back</Text>

				<TextInput
					style={styles.input}
					placeholder='Email'
					placeholderTextColor={COLORS.textSecondary} // Set placeholder color
					value={email}
					onChangeText={setEmail}
					keyboardType='email-address'
					autoCapitalize='none'
				/>
				<TextInput
					style={styles.input}
					placeholder='Password'
					placeholderTextColor={COLORS.textSecondary} // Set placeholder color
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{isLoading ? (
					<ActivityIndicator
						size='large'
						color={COLORS.accentGreen} // Use accent color
						style={{ marginTop: 20 }}
					/>
				) : (
					<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
						<Text style={styles.loginButtonText}>Log In</Text>
					</TouchableOpacity>
				)}

				<View style={styles.linkContainer}>
					<Text style={styles.secondaryText}>Don't have an account? </Text>
					<TouchableOpacity onPress={() => router.push('/register')}>
						<Text style={styles.link}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 25,
		justifyContent: 'center',
		backgroundColor: COLORS.background, // Dark background
	},
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 30,
		textAlign: 'center',
		color: COLORS.textPrimary, // White text
	},
	input: {
		height: 50,
		borderColor: COLORS.border, // Subtle border
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		backgroundColor: COLORS.card, // Dark input background
		color: COLORS.textPrimary, // White text color when typing
		fontSize: 16,
	},
	loginButton: {
		backgroundColor: COLORS.accentGreen, // Accent green background
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	loginButtonText: {
		color: COLORS.buttonTextDark, // Dark text for contrast
		fontSize: 18,
		fontWeight: 'bold',
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	secondaryText: {
		color: COLORS.textSecondary, // Light gray text
		fontSize: 16,
	},
	link: {
		color: COLORS.accentGreen, // Accent green text for links
		fontWeight: 'bold',
		fontSize: 16,
	},
})
