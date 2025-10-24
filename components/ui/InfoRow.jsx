// File: components/ui/InfoRow.jsx
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { COLORS } from '../../constants/colors'

const InfoRow = ({ label, value, isEditing, onChangeText, isLast }) => (
	<View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
		<Text style={styles.infoLabel}>{label}</Text>
		{isEditing ? (
			<TextInput
				style={styles.infoInput}
				value={value}
				onChangeText={onChangeText}
				autoCapitalize='words' // Можна налаштувати за потреби
				placeholderTextColor={COLORS.textSecondary}
			/>
		) : (
			<Text style={styles.infoValue}>{value}</Text>
		)}
	</View>
)

const styles = StyleSheet.create({
	infoRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 18,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	lastInfoRow: {
		borderBottomWidth: 0,
	},
	infoLabel: {
		fontSize: 16,
		color: COLORS.textSecondary, // Змінено для кращого контрасту
		marginRight: 10, // Додано відступ
	},
	infoValue: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.accentGreen, // Колір значення
		textAlign: 'right', // Вирівнюємо значення праворуч
	},
	infoInput: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary, // Колір тексту при редагуванні
		textAlign: 'right',
		flex: 1, // Дозволяє полю розтягуватися
		marginLeft: 10, // Відступ від мітки
	},
})

export default InfoRow
