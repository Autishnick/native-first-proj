import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'

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
						placeholderTextColor='#999'
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

					{/* Кнопка зміни напрямку сортування */}
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

				{/* Кнопка Reset */}
				{onReset && (
					<TouchableOpacity style={styles.resetButton} onPress={onReset}>
						<Text style={styles.resetButtonText}>Reset</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Категорії в горизонтальному скролі */}
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
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},

	// Пошукова строка
	searchContainer: {
		padding: 12,
	},
	searchInputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
		borderRadius: 10,
		paddingHorizontal: 12,
		height: 44,
	},
	searchIcon: {
		fontSize: 18,
		marginRight: 8,
	},
	searchInput: {
		flex: 1,
		fontSize: 15,
		color: '#333',
		padding: 0,
	},
	clearButton: {
		padding: 4,
		marginLeft: 8,
	},
	clearButtonText: {
		fontSize: 18,
		color: '#999',
		fontWeight: '600',
	},

	// Верхня панель з сортуванням
	filterBar: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 12,
		paddingBottom: 12,
		gap: 8,
	},

	// Контейнер сортування
	sortContainer: {
		flexDirection: 'row',
		gap: 6,
		flex: 1,
	},

	// Кнопки сортування
	sortButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		minWidth: 55,
		alignItems: 'center',
	},
	sortButtonActive: {
		backgroundColor: '#007AFF',
	},
	sortButtonText: {
		fontSize: 13,
		color: '#666',
		fontWeight: '500',
	},
	sortButtonTextActive: {
		color: '#fff',
		fontWeight: '600',
	},

	// Кнопка зміни напрямку (↑↓)
	orderButton: {
		backgroundColor: '#f0f0f0',
		width: 36,
		height: 36,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	orderButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#007AFF',
	},

	// Кнопка Reset
	resetButton: {
		backgroundColor: '#FF3B30',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 8,
	},
	resetButtonText: {
		color: '#fff',
		fontSize: 13,
		fontWeight: '600',
	},

	// Категорії в горизонтальному рядку
	categoriesContainer: {
		paddingHorizontal: 12,
		paddingVertical: 10,
		gap: 8,
	},
	categoryChip: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#f0f0f0',
		borderWidth: 1,
		borderColor: '#e0e0e0',
	},
	categoryChipActive: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	categoryChipText: {
		fontSize: 14,
		color: '#666',
		fontWeight: '500',
	},
	categoryChipTextActive: {
		color: '#fff',
		fontWeight: '600',
	},
})
