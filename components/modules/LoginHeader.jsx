import { useRouter } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Renamed for more general use
export default function LoginHeader() {
	const router = useRouter()

	const navigateHome = () => {
		router.replace('/(main)')
	}

	return (
		<View style={styles.container}>
			<Text style={styles.logo}>LOGO</Text>

			<TouchableOpacity onPress={navigateHome}>
				<Text style={styles.homeButtonText}>Home</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0B1A2A', // Dark background
		paddingTop: 50, // Safe area for status bar
		paddingBottom: 15,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#1C3B5A', // Subtle border
	},
	logo: {
		color: '#2ECC71', // Bright green color
		fontSize: 22,
		fontWeight: 'bold',
	},
	homeButtonText: {
		color: '#2ECC71', // Matching bright green color
		fontSize: 16,
		fontWeight: '500',
	},
})
