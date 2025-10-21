import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

export default function TaskItem({ task }) {
	const dueDate = new Date(task.dueDate.seconds * 1000).toLocaleString()

	return (
		<View style={styles.card}>
			<View style={styles.row}>
				{/* Ліва частина: текст */}
				<View style={styles.textContainer}>
					<Text style={styles.title}>{task.title}</Text>
					<Text style={styles.description}>{task.description}</Text>
					<Text style={styles.info}>Adress: {task.address}</Text>
					<Text style={styles.info}>Location: {task.location}</Text>
					<Text style={styles.info}>Payment: {task.payment} usd</Text>
					<Text style={styles.info}>Deadline: {dueDate}</Text>
					<Text style={styles.info}>Author: {task.createdBy}</Text>
				</View>

				{/* Права частина: іконка профілю */}
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
		flex: 1, // займає весь простір, крім іконки
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
	},
})
