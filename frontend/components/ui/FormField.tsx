import React, { FC } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { COLORS } from '../../constants/colors'

interface FormFieldProps extends TextInputProps {
	label: string
}

const FormField: FC<FormFieldProps> = ({
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
				style={[styles.input, style]}
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={COLORS.textPlaceholder}
				{...textInputProps}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	fieldContainer: {
		marginBottom: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 8,
	},
	input: {
		height: 50,
		borderColor: COLORS.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		fontSize: 16,
		backgroundColor: COLORS.background,
		color: COLORS.textPrimary,
	},
})

export default FormField
