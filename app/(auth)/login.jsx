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

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	buttonTextDark: '#1A202C',
	border: '#4A5568',
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
			await login(email, password)
			console.log('✅ Login successful!')

			router.replace('/(main)')
		} catch (error) {
			console.error('❌ Login failed:', error)
			console.error('Error message:', error.message)

			Alert.alert('Login Failed', error.message || 'Invalid credentials.')
		} finally {
			setIsLoading(false)
			console.log('=== LOGIN ENDED ===')
		}
	}

	return (
		<>
			<StatusBar barStyle='light-content' />
			<AppHeader />
			<View style={styles.container}>
				<Text style={styles.header}>Welcome Back</Text>

				<TextInput
					style={styles.input}
					placeholder='Email'
					placeholderTextColor={COLORS.textSecondary}
					value={email}
					onChangeText={setEmail}
					keyboardType='email-address'
					autoCapitalize='none'
				/>
				<TextInput
					style={styles.input}
					placeholder='Password'
					placeholderTextColor={COLORS.textSecondary}
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{isLoading ? (
					<ActivityIndicator
						size='large'
						color={COLORS.accentGreen}
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
		backgroundColor: COLORS.background,
	},
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 30,
		textAlign: 'center',
		color: COLORS.textPrimary,
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		backgroundColor: COLORS.card,
		color: COLORS.textPrimary,
		fontSize: 16,
	},
	loginButton: {
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	loginButtonText: {
		color: COLORS.buttonTextDark,
		fontSize: 18,
		fontWeight: 'bold',
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	secondaryText: {
		color: COLORS.textSecondary,
		fontSize: 16,
	},
	link: {
		color: COLORS.accentGreen,
		fontWeight: 'bold',
		fontSize: 16,
	},
})
