import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import TaskItem from '../ui/TaskItem'

export default function MyCreatedTasksList({
	tasks,
	onTaskPress,
	onDeleteTask,
}) {
	const renderMyTask = ({ item }) => (
		<View style={styles.myTaskWrapper}>
			<TaskItem task={item} onPress={() => onTaskPress(item)} />
			<TouchableOpacity
				style={styles.deleteButton}
				onPress={() => onDeleteTask(item.id)}
			>
				<Text style={styles.deleteButtonText}>Delete</Text>
			</TouchableOpacity>
		</View>
	)

	return (
		<FlatList
			style={styles.listStyle}
			data={tasks}
			keyExtractor={item => item.id}
			ListHeaderComponent={
				<Text style={styles.myTasksHeader}>
					My Posted Tasks ({tasks.length})
				</Text>
			}
			renderItem={renderMyTask}
			ListEmptyComponent={
				<Text style={styles.noTasksText}>
					You haven't created any tasks yet.
				</Text>
			}
			contentContainerStyle={styles.listContent}
		/>
	)
}

const styles = StyleSheet.create({
	listStyle: {
		width: '100%',
		marginTop: 30,
	},
	listContent: {
		paddingBottom: 20,
	},
	myTasksHeader: {
		fontSize: 22,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 16,
		paddingHorizontal: 10,
	},
	myTaskWrapper: {
		marginBottom: 16,
		marginHorizontal: 10,
	},
	deleteButton: {
		backgroundColor: COLORS.accentRed,
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 6,
	},
	deleteButtonText: {
		color: COLORS.textPrimary,
		fontWeight: 'bold',
	},
	noTasksText: {
		textAlign: 'center',
		color: COLORS.textSecondary,
		marginTop: 20,
		paddingHorizontal: 10,
	},
})
