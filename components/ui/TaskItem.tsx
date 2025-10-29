import { Ionicons } from '@expo/vector-icons'
import { doc, DocumentData, getDoc, Timestamp } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { db } from '../../src/firebase/config'

interface Task {
	id: string
	title: string
	description: string
	createdBy: string | null
	assignedTo: string | null
	dueDate: Timestamp
	location?: string
	address?: string
	payment: number
}

interface TaskItemProps {
	task: Task
	onPress?: () => void
}

interface AuthHookValue {
	isWorker: boolean
	userId: string | null | undefined
}

export default function TaskItem({ task, onPress }: TaskItemProps) {
	const [authorNickname, setAuthorNickname] = useState<string>('Loading...')
	const { isWorker, userId } = useAuth() as AuthHookValue
	const dueDate = new Date(task.dueDate.seconds * 1000).toLocaleString()
	const isAssigned = !!task.assignedTo
	const isMyTask = task.assignedTo === userId

	useEffect(() => {
		const fetchAuthorNickname = async () => {
			if (!task.createdBy) {
				setAuthorNickname('Unknown')
				return
			}
			try {
				const userDoc = await getDoc(doc(db, 'users', task.createdBy))
				if (userDoc.exists()) {
					const userData = userDoc.data() as DocumentData
					setAuthorNickname(userData.displayName || 'Unknown')
				} else {
					setAuthorNickname('Unknown')
				}
			} catch (error) {
				console.error('Error fetching author nickname:', error)
				setAuthorNickname('Error')
			}
		}

		if (task.createdBy) fetchAuthorNickname()
	}, [task.createdBy])

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
						📅 Created: {dueDate}
					</Text>
					<Text
						style={[styles.info, shouldShowDisabled && styles.disabledText]}
					>
						👤 Author: {authorNickname}
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
