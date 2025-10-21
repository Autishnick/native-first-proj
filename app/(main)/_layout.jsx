import { MaterialIcons } from '@expo/vector-icons' // Example of using icons
import { Tabs } from 'expo-router'
import React from 'react'

export default function TabLayout() {
	return (
		<Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Get it done',
					tabBarIcon: ({ color }) => (
						<MaterialIcons name='done' size={24} color={color} />
					),
					headerTitle: '',
				}}
			/>

			<Tabs.Screen
				name='browse'
				options={{
					title: 'Browse',
					tabBarIcon: ({ color }) => (
						<MaterialIcons name='search' size={24} color={color} />
					),
					headerTitle: '',
				}}
			/>

			<Tabs.Screen
				name='myTasks'
				options={{
					title: 'My tasks',
					tabBarIcon: ({ color }) => (
						<MaterialIcons name='task' size={24} color={color} />
					),
					headerTitle: '',
				}}
			/>
			<Tabs.Screen
				name='messages'
				options={{
					title: 'Messages',
					tabBarIcon: ({ color }) => (
						<MaterialIcons name='message' size={24} color={color} />
					),
					headerTitle: '',
				}}
			/>
			<Tabs.Screen
				name='account'
				options={{
					title: 'Account',
					tabBarIcon: ({ color }) => (
						<MaterialIcons name='person' size={24} color={color} />
					),
					headerTitle: '',
				}}
			/>
		</Tabs>
	)
}
