// Always write all code in English, including text in the code.
// Removed: doc, DocumentData, getDoc, Timestamp, useEffect, useState
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../constants/colors'
// Removed: db

interface Task {
	id: string
	title: string
	createdBy: string | null
	createdByDisplayName: string
	location?: string
	dueDate: string // <-- CHANGED: Was Timestamp
	payment: number
	description: string
	[key: string]: any
}

interface TaskDetailsDisplayProps {
	task: Task | null
}

// Updated function to handle a string date
const formatDate = (dateString: string | undefined | null): string => {
	if (!dateString) return 'N/A'
	try {
		return new Date(dateString).toLocaleDateString('en-US')
	} catch (e) {
		return 'Invalid Date'
	}
}

// Removed: useTaskAuthor hook (it's no longer needed)

export default function TaskDetailsDisplay({ task }: TaskDetailsDisplayProps) {
	// We get the name directly from the task prop
	const authorNickname = task?.createdByDisplayName || 'Unknown'
	const formattedDate = formatDate(task?.createdAt)

	if (!task) {
		return <Text style={styles.messageText}>No task details available.</Text>
	}

	return (
		<View style={styles.taskContainer}>
			<Text style={styles.title}>{task.title}</Text>
			{/* Use the direct property */}
			<Text style={styles.description}>Created by: {authorNickname}</Text>
			{task.location && (
				<Text style={styles.description}>Location: {task.location}</Text>
			)}
			<Text style={styles.description}>Creation Date: {formattedDate}</Text>
			<Text style={styles.description}>Payment: ${task.payment} USD</Text>
			<Text style={styles.description}>{task.description}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	taskContainer: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 16,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	title: {
		marginBottom: 10,
		fontSize: 24,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
	},
	description: {
		marginTop: 10,
		color: COLORS.textSecondary,
		lineHeight: 22,
		fontSize: 16,
	},
	messageText: {
		textAlign: 'center',
		color: COLORS.textSecondary,
		marginTop: 60,
		fontSize: 16,
	},
})
