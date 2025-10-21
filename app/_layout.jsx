import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { AuthProvider, useAuthContext } from '../hooks/useAuthContext'
// Цей компонент вирішує, куди перенаправити користувача
function RootLayoutNav() {
	const { user, loading } = useAuthContext()
	const router = useRouter()

	useEffect(() => {
		// Не виконуємо перенаправлення, поки йде завантаження
		if (loading) {
			return
		}

		// Якщо користувач увійшов, перенаправляємо його в основний додаток
		if (user) {
			router.replace('/(main)')
		}
		// Якщо користувач не увійшов, перенаправляємо на екран входу
		else {
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
