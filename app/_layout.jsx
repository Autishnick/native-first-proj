// app/_layout.jsx
import { Stack } from 'expo-router'
import { Text } from 'react-native'
import { useAuth } from '../hooks/useAuth'
export default function RootLayout() {
	const { user, loading } = useAuth()

	if (loading) {
		// Show loading indicator while checking auth status
		return <Text>Loading...</Text>
	}

	// Determine the starting screen based on authentication status
	const startScreen = user ? '(main)' : '(auth)'

	return (
		<Stack>
			<Stack.Screen name={startScreen} options={{ headerShown: false }} />
		</Stack>
	)
}
