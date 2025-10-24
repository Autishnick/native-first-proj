// File: components/ui/FormField.jsx
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { COLORS } from '../../constants/colors'

const FormField = ({
	label,
	value,
	onChangeText,
	placeholder,
	style,
	...textInputProps
}) => {
	return (
		<View style={styles.fieldContainer}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				style={[styles.input, style]} // Дозволяє передавати додаткові стилі (напр., для textArea)
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={COLORS.textPlaceholder} // Використовуємо textPlaceholder
				color={COLORS.textPrimary} // Задаємо колір тексту
				{...textInputProps} // Передаємо інші пропси TextInput (keyboardType, multiline, etc.)
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	fieldContainer: {
		marginBottom: 16, // Відступ між полями
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 8,
		// marginTop: 10, // Зайвий, так як є marginBottom у fieldContainer
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: COLORS.background,
	},
	// Стилі, що специфічні для textArea, будуть передаватися через пропс 'style'
})

export default FormField
