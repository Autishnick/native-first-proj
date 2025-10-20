import { Button, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../../hooks/useAuth'

export default function AccountScreen() {
	const { user, profile, loading, logout, isEmployer } = useAuth()

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading Profile...</Text>
			</View>
		)
	}

	// Display name and role information
	const userDisplayName = profile?.displayName || user?.email || 'N/A'
	const userRole =
		profile?.role === 'employer' ? 'Employer (Customer)' : 'Worker (Performer)'
	const roleColor = isEmployer ? '#007AFF' : '#28A745' // Blue for employer, Green for worker

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Account Details</Text>

			<View style={styles.profileCard}>
				<Text style={styles.label}>Name:</Text>
				<Text style={styles.value}>{userDisplayName}</Text>

				<Text style={styles.label}>Email:</Text>
				<Text style={styles.value}>{user?.email}</Text>

				<Text style={styles.label}>Role:</Text>
				<Text style={[styles.value, { color: roleColor, fontWeight: 'bold' }]}>
					{userRole}
				</Text>
			</View>

			{/* Logout Button */}
			<View style={styles.logoutButtonContainer}>
				<Button
					title='Logout'
					onPress={logout}
					color='#dc3545' // Red color for danger/logout
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: '#f5f5f5',
	},
	header: {
		fontSize: 26,
		fontWeight: 'bold',
		marginBottom: 25,
		marginTop: 30,
		color: '#333',
		textAlign: 'center',
	},
	profileCard: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	label: {
		fontSize: 14,
		color: '#888',
		marginTop: 10,
	},
	value: {
		fontSize: 18,
		marginBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		paddingBottom: 5,
	},
	logoutButtonContainer: {
		marginTop: 40,
	},
})
