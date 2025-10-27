import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { CATEGORIES_DATA } from '../../constants/CategoriesData'

export default function ActiveTodosScreen() {
	const router = useRouter()
	const handlePressCategory = categoryName => {
		console.log('Navigating to browse with category:', categoryName)
		router.push({
			pathname: '/browse',
			params: { categoryName },
		})
	}

	const renderCategoryItem = ({ item }) => (
		<TouchableOpacity
			style={styles.categoryItem}
			onPress={() => handlePressCategory(item.name)}
			activeOpacity={0.7}
		>
			<MaterialCommunityIcons name={item.icon} size={40} color='#0B1A2A' />
			<Text style={styles.categoryText}>{item.name}</Text>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<Text style={styles.mainText}>Our categories</Text>
			<FlatList
				data={CATEGORIES_DATA}
				renderItem={renderCategoryItem}
				keyExtractor={item => item.name}
				numColumns={2}
				contentContainerStyle={styles.gridContainer}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	)
}

// 6.
const styles = StyleSheet.create({
	container: {
		flex: 1,

		backgroundColor: '#F0F4F8',
	},
	gridContainer: {
		padding: 10,
	},
	categoryItem: {
		flex: 1,

		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		paddingVertical: 20,
		paddingHorizontal: 10,
		margin: 8,

		alignItems: 'center',
		justifyContent: 'center',

		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,

		minHeight: 130,
	},
	categoryText: {
		marginTop: 10,
		fontSize: 14,
		fontWeight: '500',
		color: '#0B1A2A',
		textAlign: 'center',
	},
	mainText: {
		marginTop: 10,
		fontSize: 27,
		fontWeight: '500',
		color: '#0B1A2A',
		textAlign: 'center',
	},
})
