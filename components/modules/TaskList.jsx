// File: components/modules/TaskList.jsx
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors' // Імпорт кольорів
import TaskItem from '../ui/TaskItem' // Переконайтесь, що шлях правильний

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
			ListFooterComponent={renderFooter} // Показує індикатор під час дозавантаження
			contentContainerStyle={styles.listContent}
			style={styles.listStyle} // Стиль для самого FlatList
		/>
	)
}

const styles = StyleSheet.create({
	listStyle: {
		flex: 1, // Важливо, щоб FlatList займав доступний простір
	},
	listContent: {
		paddingBottom: 20,
		paddingHorizontal: 15,
	},
	emptyContainer: {
		flex: 1, // Щоб текст був по центру, якщо список займає весь екран
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50, // Відступ зверху
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
