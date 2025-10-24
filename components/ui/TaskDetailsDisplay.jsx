// File: components/ui/TaskDetailsDisplay.jsx
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../constants/colors' // Adjust path if needed
import { db } from '../../src/firebase/config' // Adjust path if needed

// Helper to format date
const formatDate = timestamp => {
	if (!timestamp?.seconds) return 'N/A'
	try {
		return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US')
	} catch (e) {
		return 'Invalid Date'
	}
}

// Hook to fetch author nickname (optional, can be kept inside or passed as prop)
const useTaskAuthor = createdBy => {
	const [authorNickname, setAuthorNickname] = useState('Loading...')
	useEffect(() => {
		const fetchNickname = async () => {
			if (!createdBy) {
				setAuthorNickname('Unknown')
				return
			}
			try {
				const userDoc = await getDoc(doc(db, 'users', createdBy))
				if (userDoc.exists()) {
					setAuthorNickname(userDoc.data().displayName || 'Unknown')
				} else {
					setAuthorNickname('Unknown')
				}
			} catch (error) {
				console.error('Error fetching author nickname:', error)
				setAuthorNickname('Error')
			}
		}
		fetchNickname()
	}, [createdBy])
	return authorNickname
}

export default function TaskDetailsDisplay({ task }) {
	const authorNickname = useTaskAuthor(task?.createdBy)
	const formattedDate = formatDate(task?.dueDate)

	if (!task) {
		return <Text style={styles.messageText}>No task details available.</Text>
	}

	return (
		<View style={styles.taskContainer}>
			<Text style={styles.title}>{task.title}</Text>
			<Text style={styles.description}>Created by: {authorNickname}</Text>
			{task.location && (
				<Text style={styles.description}>Location: {task.location}</Text>
			)}
			<Text style={styles.description}>Target Date: {formattedDate}</Text>
			<Text style={styles.description}>Payment: {task.payment} USD</Text>
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
		// Added for the !task case
		textAlign: 'center',
		color: COLORS.textSecondary,
		marginTop: 60,
		fontSize: 16,
	},
})
