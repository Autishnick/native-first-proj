import { useState } from 'react'
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

export const InputArea = ({ onAdd }) => {
	const [inputText, setInputText] = useState('')

	const handleAddPress = () => {
		if (inputText.trim().length > 0) {
			onAdd(inputText)
			setInputText('')
		}
	}

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder='Add a new task...'
				value={inputText}
				onChangeText={setInputText}
				onSubmitEditing={handleAddPress}
				returnKeyType='done'
			/>

			<TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
				<Text style={styles.addButtonText}>Add</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		padding: 10,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		marginBottom: 15,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	input: {
		flex: 1,
		height: 40,
		fontSize: 16,
		paddingHorizontal: 10,
		backgroundColor: '#fff',
		borderRadius: 6,
		marginRight: 10,
	},
	addButton: {
		backgroundColor: 'blue',
		paddingHorizontal: 15,
		borderRadius: 6,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	addButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
})
