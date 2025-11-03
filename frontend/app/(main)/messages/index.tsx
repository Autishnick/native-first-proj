import { useQuery } from '@tanstack/react-query'
import { useNavigation, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { COLORS } from '../../../constants/colors'
import { useAuth } from '../../../hooks/useAuthContext'
import { api } from '../../../src/api/client'

interface ChatRoom {
	id: string
	participants: string[]
	participantDetails: { uid: string; displayName: string }[]
	lastMessage: { text: string; createdAt: string } | null
	taskId: string
}

const fetchChats = async (): Promise<ChatRoom[]> => {
	const { data } = await api.get('/chats')
	return data
}

export default function ChatListScreen() {
	const router = useRouter()
	const navigation = useNavigation()
	const { user } = useAuth()

	const {
		data: chats = [],
		isLoading,
		error,
	} = useQuery<ChatRoom[]>({
		queryKey: ['chats', user?.uid],
		queryFn: fetchChats,
		enabled: !!user,
	})

	useEffect(() => {
		navigation.setOptions({
			title: 'Messages',
			headerLeft: () => null,
		})
	}, [navigation])

	const handleChatPress = (chat: ChatRoom) => {
		const otherUser = chat.participantDetails.find(p => p.uid !== user?.uid)
		const chatTitle = otherUser?.displayName || 'Chat'

		router.push({
			pathname: '/messages/[TaskId]',
			params: {
				TaskId: chat.id,
				chatTitle: chatTitle,
			},
		})
	}

	if (isLoading) {
		return (
			<View style={[styles.centered, styles.container]}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (error) {
		return (
			<View style={[styles.centered, styles.container]}>
				<Text style={styles.errorText}>Error fetching chats.</Text>
			</View>
		)
	}

	return (
		<FlatList
			data={chats}
			style={styles.container}
			keyExtractor={item => item.id}
			renderItem={({ item }) => {
				const otherUser = item.participantDetails.find(p => p.uid !== user?.uid)

				return (
					<TouchableOpacity
						style={styles.chatItem}
						onPress={() => handleChatPress(item)}
					>
						<View style={styles.avatar} />
						<View style={styles.chatInfo}>
							<Text style={styles.userName}>
								{otherUser?.displayName || 'Chat User'}
							</Text>
							<Text style={styles.lastMessage} numberOfLines={1}>
								{item.lastMessage?.text || 'No messages yet'}
							</Text>
						</View>
					</TouchableOpacity>
				)
			}}
			ListEmptyComponent={
				<View style={styles.container}>
					<Text style={styles.errorText}>No chats found.</Text>
				</View>
			}
		/>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	errorText: {
		textAlign: 'center',
		marginTop: 20,
		color: COLORS.textSecondary,
	},
	chatItem: {
		flexDirection: 'row',
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		alignItems: 'center',
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: COLORS.border,
		marginRight: 16,
	},
	chatInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
	},
	lastMessage: {
		fontSize: 14,
		color: COLORS.textSecondary,
		marginTop: 4,
	},
})
