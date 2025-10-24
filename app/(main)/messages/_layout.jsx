import { Stack } from 'expo-router'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
}

export default function MessagesLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerStyle: {
					backgroundColor: COLORS.card,
				},
				headerTintColor: COLORS.textPrimary,
				headerTitleStyle: {
					color: COLORS.textPrimary,
				},
				headerBackTitleVisible: false,
			}}
		>
			<Stack.Screen name='index' options={{ title: 'Messages' }} />
			<Stack.Screen name='[TaskId]' options={{ title: 'Chat' }} ы />
		</Stack>
	)
}
