import { Stack, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { AuthProvider, useAuthContext } from '../hooks/useAuthContext'

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

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootLayoutNav />
		</AuthProvider>
	)
}
