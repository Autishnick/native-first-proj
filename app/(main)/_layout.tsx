import { Tabs } from 'expo-router'
import AppHeader from '../../components/modules/Header'

import { Ionicons } from '@expo/vector-icons'

export default function MainTabLayout() {
	return (
		<Tabs
			screenOptions={{
				header: () => <AppHeader />,
				tabBarActiveTintColor: '#2ECC71',
				tabBarInactiveTintColor: 'gray',
				tabBarStyle: {
					backgroundColor: '#0B1A2A',
					borderTopColor: '#1C3B5A',
				},
			}}
		>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Get it Done',
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name='checkmark-circle-outline'
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='browse'
				options={{
					title: 'Browse',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='search-outline' size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='myTasks'
				options={{
					title: 'My Tasks',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='person-outline' size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name='messages'
				options={{
					title: 'Messages',
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name='chatbubble-ellipses-outline'
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name='account'
				options={{
					title: 'Account',
					tabBarIcon: ({ color, size }) => (
						<Ionicons name='cog-outline' size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	)
}
