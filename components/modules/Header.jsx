import { useRouter, useSegments } from 'expo-router'
import { useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../hooks/useAuth'

export default function AppHeader() {
	const router = useRouter()
	const { profile, logout } = useAuth()
	const [confirmVisible, setConfirmVisible] = useState(false)
	const segments = useSegments()
	const currentScreen = segments[segments.length - 1]
	const navigateLogin = () => {
		router.replace('/login')
	}

	const navigateRegister = () => {
		router.replace('/register')
	}
	const navigateHome = () => {
		router.replace('/(main)')
	}
	const handleLogoutConfirm = async () => {
		try {
			await logout()
			setConfirmVisible(false)
			router.replace('/')
		} catch (error) {
			console.error('❌ Logout failed:', error)
			alert('Failed to logout. Please try again.')
		}
	}

	const formatRole = role => {
		if (!role) return 'User'
		return role.charAt(0).toUpperCase() + role.slice(1)
	}
	if (currentScreen === 'login' || currentScreen === 'register') {
		return (
			<View style={styles.container}>
				<Text style={styles.logo}>LOGO</Text>

				<TouchableOpacity onPress={navigateHome}>
					<Text style={styles.homeButtonText}>Home</Text>
				</TouchableOpacity>
			</View>
		)
	}
	return (
		<View style={styles.container}>
			<Text style={styles.logo}>LOGO</Text>

			{profile ? (
				<>
					<View style={styles.userInfo}>
						<Text style={styles.userName}>
							{profile?.displayName || 'Username'}
						</Text>
						<Text style={styles.userRole}>{formatRole(profile?.role)}</Text>
					</View>

					<TouchableOpacity
						style={styles.logoutButton}
						onPress={() => setConfirmVisible(true)}
						activeOpacity={0.7}
					>
						<Text style={styles.logoutButtonText}>Logout</Text>
					</TouchableOpacity>
				</>
			) : (
				<View style={styles.authButtonsContainer}>
					<TouchableOpacity
						style={styles.authButton}
						onPress={navigateLogin}
						activeOpacity={0.7}
					>
						<Text style={styles.authButtonText}>Log In</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.authButton}
						onPress={navigateRegister}
						activeOpacity={0.7}
					>
						<Text style={styles.authButtonText}>Sign Up</Text>
					</TouchableOpacity>
				</View>
			)}

			<Modal
				visible={confirmVisible}
				transparent
				animationType='fade'
				onRequestClose={() => setConfirmVisible(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						<Text style={styles.modalTitle}>Logout</Text>
						<Text style={styles.modalText}>
							Are you sure you want to logout?
						</Text>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalButton, styles.cancelButton]}
								onPress={() => setConfirmVisible(false)}
							>
								<Text style={styles.cancelText}>Cancel</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={[styles.modalButton, styles.confirmButton]}
								onPress={handleLogoutConfirm}
							>
								<Text style={styles.confirmText}>Logout</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0B1A2A',
		paddingTop: 50,
		paddingBottom: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#1C3B5A',
	},
	logo: {
		color: '#2ECC71',
		fontSize: 22,
		fontWeight: 'bold',
		flex: 1,
	},
	authButtonsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	authButton: {
		borderWidth: 1,
		borderColor: '#2ECC71',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	authButtonText: {
		color: '#2ECC71',
		fontSize: 14,
		fontWeight: '500',
	},
	userInfo: {
		alignItems: 'flex-end',
		marginHorizontal: 10,
		flexGrow: 1,
	},
	userName: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
	userRole: {
		color: '#A0B3C9',
		fontSize: 12,
	},
	logoutButton: {
		borderWidth: 1,
		borderColor: '#2ECC71',
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	logoutButtonText: {
		color: '#2ECC71',
		fontSize: 14,
		fontWeight: '500',
	},
	homeButtonText: {
		color: '#2ECC71',
		fontSize: 16,
		fontWeight: '500',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContainer: {
		width: '80%',
		backgroundColor: '#1C2A3A',
		borderRadius: 12,
		padding: 20,
		alignItems: 'center',
	},
	modalTitle: {
		color: '#fff',
		fontSize: 20,
		fontWeight: '700',
		marginBottom: 10,
	},
	modalText: {
		color: '#A0B3C9',
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 20,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	modalButton: {
		flex: 1,
		marginHorizontal: 5,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#2C3E50',
	},
	confirmButton: {
		backgroundColor: '#E74C3C',
	},
	cancelText: {
		color: '#BDC3C7',
		fontWeight: '600',
	},
	confirmText: {
		color: '#fff',
		fontWeight: '700',
	},
})
