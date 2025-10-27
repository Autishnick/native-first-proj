import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import TaskItem from '../ui/TaskItem'

const TaskList = ({ tasks, onTaskPress, isLoading, searchQuery }) => {
	const renderEmptyList = () => {
		const message =
			searchQuery && searchQuery.trim() !== ''
				? `No tasks found starting with "${searchQuery}"`
				: 'No tasks found for this selection.'
		return (
			<View style={styles.emptyContainer}>
				<Text style={styles.emptyText}>{message}</Text>
			</View>
		)
	}

	const renderFooter = () => {
		if (!isLoading) return null
		return (
			<View style={styles.footerLoader}>
				<ActivityIndicator color={COLORS.accentGreen} />
			</View>
		)
	}

	return (
		<FlatList
			data={tasks}
			renderItem={({ item }) => (
				<TaskItem task={item} onPress={() => onTaskPress(item)} />
			)}
			keyExtractor={item => item.id}
			ListEmptyComponent={renderEmptyList}
			ListFooterComponent={renderFooter}
			contentContainerStyle={styles.listContent}
			style={styles.listStyle}
		/>
	)
}

const styles = StyleSheet.create({
	listStyle: {
		flex: 1,
	},
	listContent: {
		paddingBottom: 20,
		paddingHorizontal: 15,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50,
	},
	emptyText: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
	},
	footerLoader: {
		paddingVertical: 20,
	},
})

export default TaskList
