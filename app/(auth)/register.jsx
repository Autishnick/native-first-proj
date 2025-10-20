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

export default function RegisterScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confPassword, setConfPassword] = useState('') // New state for confirmation
	const [displayName, setDisplayName] = useState('')
	const [role, setRole] = useState('worker') // Default role
	const [isLoading, setIsLoading] = useState(false)

	const { register } = useAuth()

	const handleRegister = async () => {
		// 1. Check if all fields are filled
		if (!email || !password || !confPassword || !displayName) {
			Alert.alert('Error', 'Please fill in all fields.')
			return
		}

		// 2. CRITICAL CHECK: Password confirmation
		if (password !== confPassword) {
			Alert.alert('Error', 'Passwords do not match. Please try again.')
			return
		}

		setIsLoading(true)
		try {
			// 3. Call register with email, password, role, and display name
			// Note: We only pass the main 'password', not the confirmation field
			await register(email, password, role, displayName)

			// Success: Redirect to the main app screen (handled by root layout)
			router.replace('/(main)')
		} catch (error) {
			console.error('Registration failed:', error)
			// Display a user-friendly error message
			Alert.alert(
				'Registration Failed',
				error.message || 'An unknown error occurred.'
			)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Create New Account</Text>

			<TextInput
				style={styles.input}
				placeholder='Display Name'
				value={displayName}
				onChangeText={setDisplayName}
			/>
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

			{/* NEW FIELD: Confirm Password */}
			<TextInput
				style={styles.input}
				placeholder='Confirm Password'
				value={confPassword}
				onChangeText={setConfPassword}
				secureTextEntry
			/>

			{/* Role Selection UI */}
			<Text style={styles.roleLabel}>Select Your Role:</Text>
			<View style={styles.roleSelector}>
				<RoleButton
					title='Worker (Performer)'
					roleValue='worker'
					currentRole={role}
					onSelect={setRole}
					color='green'
				/>
				<RoleButton
					title='Employer (Customer)'
					roleValue='employer'
					currentRole={role}
					onSelect={setRole}
					color='blue'
				/>
			</View>

			{isLoading ? (
				<ActivityIndicator
					size='large'
					color='#007AFF'
					style={{ marginTop: 20 }}
				/>
			) : (
				<TouchableOpacity
					style={styles.registerButton}
					onPress={handleRegister}
				>
					<Text style={styles.registerButtonText}>Register</Text>
				</TouchableOpacity>
			)}

			<View style={styles.linkContainer}>
				<Text>Already have an account? </Text>
				<Link href='/login' style={styles.link}>
					Login
				</Link>
			</View>
		</View>
	)
}

// Simple component for role selection buttons
const RoleButton = ({ title, roleValue, currentRole, onSelect, color }) => (
	<TouchableOpacity
		style={[
			styles.roleButton,
			{ borderColor: currentRole === roleValue ? color : '#ccc' },
		]}
		onPress={() => onSelect(roleValue)}
	>
		<Text
			style={[
				styles.roleButtonText,
				{ color: currentRole === roleValue ? color : '#555' },
			]}
		>
			{title}
		</Text>
	</TouchableOpacity>
)

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
	roleLabel: {
		fontSize: 16,
		marginTop: 10,
		marginBottom: 8,
		color: '#555',
		fontWeight: '500',
	},
	roleSelector: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	roleButton: {
		flex: 1,
		padding: 12,
		marginHorizontal: 5,
		borderWidth: 2,
		borderRadius: 8,
		alignItems: 'center',
	},
	roleButtonText: {
		fontWeight: 'bold',
	},
	registerButton: {
		backgroundColor: 'orange',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	registerButtonText: {
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
		color: '#007AFF',
		fontWeight: 'bold',
	},
})
