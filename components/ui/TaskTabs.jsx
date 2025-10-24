// File: components/ui/TaskTabs.jsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../../constants/colors'

export default function TaskTabs({
	activeTab,
	onTabChange,
	availableTaskCount,
}) {
	return (
		<View style={styles.tabSelector}>
			<TouchableOpacity
				style={[styles.tabButton, activeTab === 'taken' && styles.activeTab]}
				onPress={() => onTabChange('taken')}
			>
				<Text
					style={[
						styles.tabText,
						activeTab === 'taken' && styles.activeTabText,
					]}
				>
					My Jobs
				</Text>
			</TouchableOpacity>
			<TouchableOpacity
				style={[
					styles.tabButton,
					activeTab === 'available' && styles.activeTab,
				]}
				onPress={() => onTabChange('available')}
			>
				<Text
					style={[
						styles.tabText,
						activeTab === 'available' && styles.activeTabText,
					]}
				>
					Available ({availableTaskCount})
				</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	tabSelector: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 10,
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 8,
		marginHorizontal: 6,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	activeTab: {
		backgroundColor: COLORS.accentGreen,
		borderColor: COLORS.accentGreen,
	},
	tabText: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.textSecondary,
	},
	activeTabText: {
		color: COLORS.buttonTextDark,
	},
})
