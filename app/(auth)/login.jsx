import { Link, router } from 'expo-router'
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
import { useAuth } from '../../hooks/useAuth'

export default function LoginScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const { login } = useAuth()

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Please enter email and password.')
			return
		}

		setIsLoading(true)
		try {
			// 1. Call the login function from useAuth
			await login(email, password)

			// Success: Redirect to the main app screen (handled by root layout after auth state change)
			router.replace('/(main)')
		} catch (error) {
			console.error('Login failed:', error)
			// Display a user-friendly error message
			Alert.alert('Login Failed', error.message || 'Invalid credentials.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Welcome Back</Text>

			<TextInput
				style={styles.input}
				placeholder='Email'
				value={email}
				onChangeText={setEmail}
				keyboardType='email-address'
				autoCapitalize='none'
			/>
			<TextInput
				style={styles.input}
				placeholder='Password'
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>

			{isLoading ? (
				<ActivityIndicator
					size='large'
					color='#007AFF'
					style={{ marginTop: 20 }}
				/>
			) : (
				<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
					<Text style={styles.loginButtonText}>Log In</Text>
				</TouchableOpacity>
			)}

			<View style={styles.linkContainer}>
				<Text>Don't have an account? </Text>
				<Link href='/register' style={styles.link}>
					Register
				</Link>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 25,
		justifyContent: 'center',
		backgroundColor: '#fff',
	},
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 30,
		textAlign: 'center',
		color: '#333',
	},
	input: {
		height: 50,
		borderColor: '#ccc',
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		backgroundColor: '#f9f9f9',
	},
	loginButton: {
		backgroundColor: '#007AFF', // Blue color for primary action
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	loginButtonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	link: {
		color: 'orange', // Orange to match register button color in the other file
		fontWeight: 'bold',
	},
})
