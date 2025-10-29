import { Stack } from 'expo-router'
import React from 'react'

const COLORS: { background: string; card: string; textPrimary: string } = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
}

const MessagesLayout: React.FC = () => {
	const screenOptions = {
		headerShown: true,
		headerStyle: { backgroundColor: COLORS.card },
		headerTintColor: COLORS.textPrimary,
		headerTitleStyle: { color: COLORS.textPrimary },
		headerBackTitleVisible: false,
	}

	return (
		<Stack screenOptions={screenOptions}>
			<Stack.Screen name='index' options={{ title: 'Messages' }} />
			<Stack.Screen name='[TaskId]' options={{ title: 'Chat' }} />
		</Stack>
	)
}

export default MessagesLayout
