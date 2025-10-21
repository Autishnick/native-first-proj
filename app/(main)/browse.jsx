import { ScrollView, Text } from 'react-native'
import AppHeader from '../../components/modules/Header'
import TaskItem from '../../components/ui/TaskItem'
import { useTasks } from '../../hooks/useTasks'

export default function browse() {
	const { tasks, loading, error } = useTasks()

	if (loading) return <Text>Завантаження...</Text>
	if (error) return <Text>Помилка завантаження тасків</Text>

	return (
		<ScrollView>
			<AppHeader />
			{tasks.map(task => (
				<TaskItem key={task.id} task={task} />
			))}
		</ScrollView>
	)
}
