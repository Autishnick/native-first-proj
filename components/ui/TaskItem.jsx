import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export const TodoItem = ({ title, isCompleted, onToggle }) => {
	return (
		<TouchableOpacity onPress={onToggle} style={styles.container}>
			<Text style={[styles.text, isCompleted && styles.completedText]}>
				{isCompleted ? '✅ ' : '⬜ '}
				{title}
			</Text>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	container: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		backgroundColor: '#fff',
	},
	text: {
		fontSize: 18,
	},
	completedText: {
		textDecorationLine: 'line-through',
		color: '#aaa',
	},
})
