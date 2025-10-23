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

const RoleButton = ({ title, roleValue, currentRole, onSelect }) => (
	<TouchableOpacity
		style={[
			styles.roleButton,
			{
				borderColor:
					currentRole === roleValue ? COLORS.accentGreen : COLORS.border,
				backgroundColor:
					currentRole === roleValue ? `${COLORS.accentGreen}15` : 'transparent',
			},
		]}
		onPress={() => onSelect(roleValue)}
	>
		<Text
			style={[
				styles.roleButtonText,
				{
					color:
						currentRole === roleValue
							? COLORS.accentGreen
							: COLORS.textSecondary,
				},
			]}
		>
			{title}
		</Text>
	</TouchableOpacity>
)

export default function RegisterScreen() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confPassword, setConfPassword] = useState('')
	const [displayName, setDisplayName] = useState('')
	const [role, setRole] = useState('worker')
	const [isLoading, setIsLoading] = useState(false)

	const { register } = useAuth()

	const handleRegister = async () => {
		console.log('=== REGISTRATION STARTED ===')
		console.log('Email:', email)
		console.log('Display Name:', displayName)
		console.log('Role:', role)

		if (!email || !password || !confPassword || !displayName) {
			console.log('❌ Validation failed: Missing fields')
			Alert.alert('Error', 'Please fill in all fields.')
			return
		}

		if (password !== confPassword) {
			console.log('❌ Validation failed: Passwords do not match')
			Alert.alert('Error', 'Passwords do not match. Please try again.')
			return
		}

		console.log('✅ Validation passed, calling register...')
		setIsLoading(true)
		try {
			await register(email, password, role, displayName)
			console.log('✅ Registration successful!')

			router.replace('/(main)')
		} catch (error) {
			console.error('❌ Registration failed:', error)
			console.error('Error code:', error.code)
			console.error('Error message:', error.message)

			Alert.alert(
				'Registration Failed',
				error.message || 'An unknown error occurred.'
			)
		} finally {
			setIsLoading(false)
			console.log('=== REGISTRATION ENDED ===')
		}
	}

	return (
		<>
			<StatusBar barStyle='light-content' />
			<AppHeader />

			<View style={styles.container}>
				<Text style={styles.header}>Create New Account</Text>

				<TextInput
					style={styles.input}
					placeholder='Display Name'
					placeholderTextColor={COLORS.textSecondary}
					value={displayName}
					onChangeText={setDisplayName}
				/>
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

				<TextInput
					style={styles.input}
					placeholder='Confirm Password'
					placeholderTextColor={COLORS.textSecondary}
					value={confPassword}
					onChangeText={setConfPassword}
					secureTextEntry
				/>

				<Text style={styles.roleLabel}>Select Your Role:</Text>
				<View style={styles.roleSelector}>
					<RoleButton
						title='Worker (Performer)'
						roleValue='worker'
						currentRole={role}
						onSelect={setRole}
					/>
					<RoleButton
						title='Employer (Customer)'
						roleValue='employer'
						currentRole={role}
						onSelect={setRole}
					/>
				</View>

				{isLoading ? (
					<ActivityIndicator
						size='large'
						color={COLORS.accentGreen}
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
					<Text style={styles.secondaryText}>Already have an account? </Text>
					<TouchableOpacity onPress={() => router.push('/login')}>
						<Text style={styles.link}>Login</Text>
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
	roleLabel: {
		fontSize: 16,
		marginTop: 10,
		marginBottom: 8,
		color: COLORS.textPrimary,
		fontWeight: '500',
	},
	roleSelector: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
		marginHorizontal: -5,
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
		fontSize: 14,
	},
	registerButton: {
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 10,
	},
	registerButtonText: {
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
