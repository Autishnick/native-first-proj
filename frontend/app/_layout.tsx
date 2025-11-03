import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '../hooks/useAuthContext'

// 1️⃣ Створюємо клієнт React Query
const queryClient = new QueryClient()

function RootLayoutNav() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const segments = useSegments()

	// 2️⃣ Визначення груп
	const inAuthGroup = segments[0] === '(auth)'
	const currentPath = segments.join('/')

	// 3️⃣ Стан монтування
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		// Позначаємо, що компонент змонтовано
		setMounted(true)
	}, [])

	useEffect(() => {
		// 🚫 Якщо ще не змонтовано або йде завантаження — нічого не робимо
		if (!mounted || loading) return

		// 🚫 Якщо сегменти ще не готові (expo-router ще ініціалізується)
		if (!segments.length) return

		// --- Основна логіка навігації ---
		if (user) {
			// Якщо користувач автентифікований і ми у групі (auth)
			if (inAuthGroup) {
				if (currentPath !== '(main)') {
					router.replace('/(main)')
				}
			}
		} else {
			// Якщо користувач неавтентифікований і ми поза (auth)
			if (!inAuthGroup) {
				if (
					currentPath !== '(auth)/login' &&
					currentPath !== '(auth)/register'
				) {
					router.replace('/(auth)/login')
				}
			}
		}
	}, [user, loading, mounted, router, segments, inAuthGroup, currentPath])

	// 4️⃣ Splash або пустий екран, поки все ініціалізується
	if (loading || !mounted) {
		return null
	}

	return (
		<Stack>
			<Stack.Screen name='(auth)' options={{ headerShown: false }} />
			<Stack.Screen name='(main)' options={{ headerShown: false }} />
		</Stack>
	)
}

export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<RootLayoutNav />
			</AuthProvider>
		</QueryClientProvider>
	)
}
