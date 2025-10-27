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
				autoCapitalize='words'
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
		color: COLORS.textSecondary,
		marginRight: 10,
	},
	infoValue: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.accentGreen,
		textAlign: 'right',
	},
	infoInput: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textPrimary,
		textAlign: 'right',
		flex: 1,
		marginLeft: 10,
	},
})

export default InfoRow
