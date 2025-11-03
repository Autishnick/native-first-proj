import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../../constants/colors'

interface CategorySelectorProps {
	categories: string[]
	selectedCategory: string
	onSelectCategory: (category: string) => void
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
	categories,
	selectedCategory,
	onSelectCategory,
}) => {
	return (
		<View style={styles.categoryContainer}>
			{categories.map((cat: string) => (
				<TouchableOpacity
					key={cat}
					style={[
						styles.categoryButton,
						selectedCategory === cat && styles.categoryButtonActive,
					]}
					onPress={() => onSelectCategory(cat)}
				>
					<Text
						style={[
							styles.categoryButtonText,
							selectedCategory === cat && styles.categoryButtonTextActive,
						]}
					>
						{cat}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	categoryContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginBottom: 16,
		marginTop: 8,
	},
	categoryButton: {
		backgroundColor: COLORS.background,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		marginRight: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	categoryButtonActive: {
		backgroundColor: COLORS.accentGreen,
		borderColor: COLORS.accentGreen,
	},
	categoryButtonText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		fontWeight: '600',
	},
	categoryButtonTextActive: {
		color: COLORS.buttonTextDark,
	},
})

export default CategorySelector
