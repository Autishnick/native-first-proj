import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, useRouter, useSegments } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from '../hooks/useAuthContext'

const queryClient = new QueryClient()

function RootLayoutNav() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const segments = useSegments()

	const inAuthGroup = segments[0] === '(auth)'
	const currentPath = segments.join('/')

	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		if (!mounted || loading) return

		if (!segments.length) return

		if (user) {
			if (inAuthGroup) {
				if (currentPath !== '(main)') {
					router.replace('/(main)')
				}
			}
		} else {
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
