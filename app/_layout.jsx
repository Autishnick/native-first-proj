import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { AuthProvider, useAuthContext } from '../hooks/useAuthContext'
// Цей компонент вирішує, куди перенаправити користувача
function RootLayoutNav() {
	const { user, loading } = useAuthContext()
	const router = useRouter()

	useEffect(() => {
		if (loading) {
			return
		}

		if (user) {
			router.replace('/(main)')
		} else {
			router.replace('/(auth)/login')
		}
	}, [user, loading, router])

	if (loading) {
		return null
	}

	return (
		<Stack>
			<Stack.Screen name='(auth)' options={{ headerShown: false }} />
			<Stack.Screen name='(main)' options={{ headerShown: false }} />
			<Stack.Screen name='(auth)/login' options={{ headerShown: false }} />
			<Stack.Screen name='(auth)/register' options={{ headerShown: false }} />
		</Stack>
	)
}

// Головний експорт, який обгортає все в AuthProvider
export default function RootLayout() {
	return (
		<AuthProvider>
			<RootLayoutNav />
		</AuthProvider>
	)
}
