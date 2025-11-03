import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useRouter } from 'expo-router'
import React from 'react'
import {
	ActivityIndicator,
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

import { COLORS } from '../../constants/colors'
import { api } from '../../src/api/client'

type CategoryIconName = React.ComponentProps<
	typeof MaterialCommunityIcons
>['name']

interface CategoryItem {
	name: string
	icon: CategoryIconName
}

export default function ActiveTodosScreen() {
	const router = useRouter()

	const {
		data: categories = [],
		isLoading,
		error,
	} = useQuery<CategoryItem[], AxiosError>({
		queryKey: ['categories'],
		queryFn: async () => {
			const { data } = await api.get('/categories')
			return data
		},
	})

	const handlePressCategory = (categoryName: string) => {
		console.log('Navigating to browse with category:', categoryName)
		router.push({
			pathname: '/browse',
			params: { categoryName },
		})
	}

	const renderCategoryItem = ({ item }: ListRenderItemInfo<CategoryItem>) => (
		<TouchableOpacity
			style={styles.categoryItem}
			onPress={() => handlePressCategory(item.name)}
			activeOpacity={0.7}
		>
			<MaterialCommunityIcons name={item.icon} size={40} color='#0B1A2A' />
			<Text style={styles.categoryText}>{item.name}</Text>
		</TouchableOpacity>
	)

	if (isLoading) {
		return (
			<View style={[styles.container, styles.centered]}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (error) {
		return (
			<View style={[styles.container, styles.centered]}>
				<Text style={styles.errorText}>
					Error loading categories: {error.message}
				</Text>
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<Text style={styles.mainText}>Our categories</Text>
			<FlatList
				data={categories}
				renderItem={renderCategoryItem}
				keyExtractor={item => item.name}
				numColumns={2}
				contentContainerStyle={styles.gridContainer}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F0F4F8',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		color: COLORS.accentRed,
		fontSize: 16,
		textAlign: 'center',
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
