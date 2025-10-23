import { Ionicons } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { db } from '../../src/firebase/config'

export default function TaskItem({ task }) {
	const [authorNickname, setAuthorNickname] = useState('Loading...')
	const dueDate = new Date(task.dueDate.seconds * 1000).toLocaleString()

	useEffect(() => {
		const fetchAuthorNickname = async () => {
			try {
				const userDoc = await getDoc(doc(db, 'users', task.createdBy))
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

		if (task.createdBy) {
			fetchAuthorNickname()
		}
	}, [task.createdBy])

	return (
		<View style={styles.card}>
			<View style={styles.row}>
				<View style={styles.textContainer}>
					<Text style={styles.title}>{task.title}</Text>
					<Text style={styles.description}>{task.description}</Text>

					{task.location && task.location.trim() !== '' && (
						<Text style={styles.info}>📍 Location: {task.location}</Text>
					)}

					{task.address && task.address.trim() !== '' && (
						<Text style={styles.info}>🏠 Address: {task.address}</Text>
					)}

					<Text style={styles.info}>💰 Payment: ${task.payment}</Text>
					<Text style={styles.info}>📅 Created: {dueDate}</Text>
					<Text style={styles.info}>👤 Author: {authorNickname}</Text>
				</View>
				<View style={styles.avatarContainer}>
					<Ionicons name='person-circle-outline' size={60} color='#666' />
				</View>
			</View>
		</View>
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
})
