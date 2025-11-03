import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../hooks/useAuthContext'

interface Task {
	id: string
	title: string
	description: string
	createdBy: string | null
	createdByDisplayName: string
	assignedTo: string | null
	createdAt: string
	dueDate?: string
	location?: string
	address?: string
	payment: number
}

interface TaskItemProps {
	task: Task
	onPress?: () => void
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
	const { user, profile } = useAuth()

	const userId = user?.uid
	const isWorker = profile?.role === 'worker'

	const creationDate = task.createdAt
		? new Date(task.createdAt).toLocaleString()
		: 'No date'

	const isAssigned = !!task.assignedTo
	const isMyTask = task.assignedTo === userId

	const handlePress = (): void => {
		if (isWorker && isAssigned && !isMyTask) {
			Alert.alert(
				'Task Unavailable',
				'This task is already assigned to someone else.'
			)
		} else {
			onPress?.()
		}
	}

	const shouldShowDisabled = isWorker && isAssigned && !isMyTask

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={handlePress}
			style={[styles.card, shouldShowDisabled && styles.disabledCard]}
		>
			<View style={styles.row}>
				<View style={styles.textContainer}>
					<Text
						style={[styles.title, shouldShowDisabled && styles.disabledText]}
					>
						{task.title}
					</Text>
					<Text
						style={[
							styles.description,
							shouldShowDisabled && styles.disabledText,
						]}
					>
						{task.description}
					</Text>

					{task.location && task.location.trim() !== '' && (
						<Text
							style={[styles.info, shouldShowDisabled && styles.disabledText]}
						>
							📍 Location: {task.location}
						</Text>
					)}

					{task.address && task.address.trim() !== '' && (
						<Text
							style={[styles.info, shouldShowDisabled && styles.disabledText]}
						>
							🏠 Address: {task.address}
						</Text>
					)}

					<Text
						style={[styles.info, shouldShowDisabled && styles.disabledText]}
					>
						💰 Payment: ${task.payment}
					</Text>
					<Text
						style={[styles.info, shouldShowDisabled && styles.disabledText]}
					>
						📅 Created: {creationDate}
					</Text>
					<Text
						style={[styles.info, shouldShowDisabled && styles.disabledText]}
					>
						👤 Author: {task.createdByDisplayName || 'Unknown'}
					</Text>

					{isAssigned && (
						<Text
							style={[
								styles.info,
								{
									color: shouldShowDisabled ? '#888' : '#4CAF50',
									fontWeight: '600',
								},
							]}
						>
							{isMyTask
								? '✅ Your task'
								: !isWorker
								? '✅ Task is assigned'
								: '🔒 Assigned to someone else'}
						</Text>
					)}
				</View>

				<View style={styles.avatarContainer}>
					<Ionicons
						name='person-circle-outline'
						size={60}
						color={shouldShowDisabled ? '#aaa' : '#666'}
					/>
				</View>
			</View>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#fff',
		padding: 16,
		marginVertical: 8,
		marginHorizontal: 16,
		borderRadius: 8,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},
	disabledCard: {
		backgroundColor: '#f0f0f0',
		opacity: 0.9,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	textContainer: {
		flex: 1,
		paddingRight: 12,
	},
	avatarContainer: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		marginBottom: 8,
	},
	info: {
		fontSize: 12,
		color: '#666',
		marginBottom: 2,
	},
	disabledText: {
		color: '#999',
	},
})
