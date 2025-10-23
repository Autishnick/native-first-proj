import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	accentRed: '#F56565',
	buttonTextDark: '#1A202C',
	border: '#4A5568',
}

export default function FilterSection({
	currentSort,
	onSortChange,
	categories,
	currentCategory,
	onCategoryChange,
	sortOrder,
	onSortOrderChange,
	onReset,
	searchQuery,
	onSearchChange,
}) {
	const toggleSortOrder = () => {
		if (onSortOrderChange) {
			onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
		}
	}

	const clearSearch = () => {
		if (onSearchChange) {
			onSearchChange('')
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<View style={styles.searchInputWrapper}>
					<Text style={styles.searchIcon}>🔍</Text>
					<TextInput
						style={styles.searchInput}
						placeholder='Search tasks...'
						placeholderTextColor={COLORS.textSecondary}
						value={searchQuery}
						onChangeText={onSearchChange}
						returnKeyType='search'
					/>
					{searchQuery.length > 0 && (
						<TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
							<Text style={styles.clearButtonText}>✕</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			<View style={styles.filterBar}>
				<View style={styles.sortContainer}>
					<TouchableOpacity
						style={[
							styles.sortButton,
							currentSort === 'date' && styles.sortButtonActive,
						]}
						onPress={() => onSortChange('date')}
					>
						<Text
							style={[
								styles.sortButtonText,
								currentSort === 'date' && styles.sortButtonTextActive,
							]}
						>
							Date
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.sortButton,
							currentSort === 'price' && styles.sortButtonActive,
						]}
						onPress={() => onSortChange('price')}
					>
						<Text
							style={[
								styles.sortButtonText,
								currentSort === 'price' && styles.sortButtonTextActive,
							]}
						>
							Price
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.sortButton,
							currentSort === 'alphabet' && styles.sortButtonActive,
						]}
						onPress={() => onSortChange('alphabet')}
					>
						<Text
							style={[
								styles.sortButtonText,
								currentSort === 'alphabet' && styles.sortButtonTextActive,
							]}
						>
							A-Z
						</Text>
					</TouchableOpacity>

					{onSortOrderChange && (
						<TouchableOpacity
							style={styles.orderButton}
							onPress={toggleSortOrder}
						>
							<Text style={styles.orderButtonText}>
								{sortOrder === 'asc' ? '↑' : '↓'}
							</Text>
						</TouchableOpacity>
					)}
				</View>

				{onReset && (
					<TouchableOpacity style={styles.resetButton} onPress={onReset}>
						<Text style={styles.resetButtonText}>Reset</Text>
					</TouchableOpacity>
				)}
			</View>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.categoriesContainer}
			>
				<TouchableOpacity
					style={[
						styles.categoryChip,
						currentCategory === 'all' && styles.categoryChipActive,
					]}
					onPress={() => onCategoryChange('all')}
				>
					<Text
						style={[
							styles.categoryChipText,
							currentCategory === 'all' && styles.categoryChipTextActive,
						]}
					>
						All
					</Text>
				</TouchableOpacity>

				{categories.map(category => (
					<TouchableOpacity
						key={category}
						style={[
							styles.categoryChip,
							currentCategory === category && styles.categoryChipActive,
						]}
						onPress={() => onCategoryChange(category)}
					>
						<Text
							style={[
								styles.categoryChipText,
								currentCategory === category && styles.categoryChipTextActive,
							]}
						>
							{category}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.card,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
	},

	searchContainer: {
		padding: 12,
	},
	searchInputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.background,
		borderRadius: 10,
		paddingHorizontal: 12,
		height: 44,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	searchIcon: {
		fontSize: 18,
		marginRight: 8,
		color: COLORS.textSecondary,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		color: COLORS.textPrimary,
		padding: 0,
	},
	clearButton: {
		padding: 4,
		marginLeft: 8,
	},
	clearButtonText: {
		fontSize: 18,
		color: COLORS.textSecondary,
		fontWeight: '600',
	},

	filterBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingBottom: 12,
		gap: 8,
	},

	sortContainer: {
		flexDirection: 'row',
		gap: 6,
		flex: 1,
	},

	sortButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: COLORS.background,
		minWidth: 55,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	sortButtonActive: {
		backgroundColor: COLORS.accentGreen,
		borderColor: COLORS.accentGreen,
	},
	sortButtonText: {
		fontSize: 13,
		color: COLORS.textSecondary,
		fontWeight: '500',
	},
	sortButtonTextActive: {
		color: COLORS.buttonTextDark,
		fontWeight: '600',
	},

	orderButton: {
		backgroundColor: COLORS.background,
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	orderButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: COLORS.accentGreen,
	},

	resetButton: {
		backgroundColor: COLORS.accentRed,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
	},
	resetButtonText: {
		color: COLORS.textPrimary,
		fontSize: 13,
		fontWeight: '600',
	},

	categoriesContainer: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 8,
	},
	categoryChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: COLORS.background,
		borderWidth: 1,
		borderColor: COLORS.border,
	},
	categoryChipActive: {
		backgroundColor: COLORS.accentGreen,
		borderColor: COLORS.accentGreen,
	},
	categoryChipText: {
		fontSize: 14,
		color: COLORS.textSecondary,
		fontWeight: '500',
	},
	categoryChipTextActive: {
		color: COLORS.buttonTextDark,
		fontWeight: '600',
	},
})
