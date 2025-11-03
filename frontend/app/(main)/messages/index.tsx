import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { FC, useMemo } from 'react'
import {
	ActivityIndicator,
	FlatList,
	ListRenderItemInfo,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../hooks/useAuthContext'
import {
	ChatMessage,
	useChatList,
	UseChatListReturn,
} from '../../../hooks/useChatList'

const COLORS: Record<string, string> = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	unreadBackground: '#374151',
	readBackground: '#2D3748',
	border: '#4A5568',
	buttonTextDark: '#1A202C',
}

interface ChatGroup {
	chatId: string
	otherUserId: string
	otherUserName: string
	lastMessage: ChatMessage
	unreadCount: number
}

const ChatListScreen: FC = () => {
	const { user } = useAuth()
	const userId = user?.uid
	const router = useRouter()

	const { messages: allMessages, loading } = useChatList(
		userId
	) as UseChatListReturn

	const chatGroups = useMemo<ChatGroup[]>(() => {
		if (!allMessages || allMessages.length === 0) {
			return []
		}

		const groups = new Map<string, ChatGroup>()

		allMessages.forEach((msg: ChatMessage) => {
			const chatId = msg.taskId
			if (!chatId) return

			const otherPersonId =
				msg.senderId === userId ? msg.recipientId : msg.senderId
			const otherPersonName =
				msg.senderId === userId ? msg.recipientName : msg.senderName

			if (!groups.has(chatId)) {
				groups.set(chatId, {
					chatId,
					otherUserId: otherPersonId,
					otherUserName: otherPersonName || 'Chat',
					lastMessage: msg,
					unreadCount: 0,
				})
			} else {
				const chat = groups.get(chatId)

				const newMsgTime = msg.createdAt?.toDate()?.getTime() || 0
				const lastMsgTime =
					chat?.lastMessage.createdAt?.toDate()?.getTime() || 0

				if (chat && newMsgTime > lastMsgTime) {
					chat.lastMessage = msg
				}
			}

			const chat = groups.get(chatId)
			if (chat && !msg.read && msg.recipientId === userId) {
				chat.unreadCount++
			}
		})

		return Array.from(groups.values()).sort(
			(a, b) =>
				(b.lastMessage.createdAt?.toDate()?.getTime() || 0) -
				(a.lastMessage.createdAt?.toDate()?.getTime() || 0)
		)
	}, [allMessages, userId])

	const handlePressChat = (chat: ChatGroup): void => {
		router.push({
			pathname: '/messages/[TaskId]',
			params: {
				TaskId: chat.chatId,
				otherUserId: chat.otherUserId,
				otherUserName: chat.otherUserName,
			},
		})
	}

	const renderChatItem = ({ item }: ListRenderItemInfo<ChatGroup>) => {
		const lastMsg = item.lastMessage
		const isMyLastMessage = lastMsg.senderId === userId
		const time =
			lastMsg.createdAt?.toDate()?.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}) || ''

		return (
			<TouchableOpacity
				style={[styles.item, item.unreadCount > 0 && styles.unread]}
				onPress={() => handlePressChat(item)}
			>
				<View style={styles.avatar}>
					<Ionicons
						name='chatbubbles-outline'
						size={24}
						color={COLORS.accentGreen}
					/>
				</View>
				<View style={styles.chatContent}>
					<Text style={styles.chatName}>{item.otherUserName}</Text>
					<Text style={styles.messageText} numberOfLines={1}>
						{isMyLastMessage ? 'You: ' : ''}
						{lastMsg.type === 'new_bid'
							? `Sent a bid: $${lastMsg.bidAmount || 0}`
							: lastMsg.message}
					</Text>
				</View>
				<View style={styles.chatMeta}>
					<Text style={styles.timeText}>{time}</Text>
					{item.unreadCount > 0 && (
						<View style={styles.unreadBadge}>
							<Text style={styles.unreadText}>{item.unreadCount}</Text>
						</View>
					)}
				</View>
			</TouchableOpacity>
		)
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<StatusBar barStyle='light-content' />
			<FlatList<ChatGroup>
				data={chatGroups}
				renderItem={renderChatItem}
				keyExtractor={item => item.chatId}
				ListEmptyComponent={<Text style={styles.emptyText}>No chats yet.</Text>}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.background,
	},
	item: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.border,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.readBackground,
	},
	unread: {
		backgroundColor: COLORS.unreadBackground,
	},
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: COLORS.card,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	chatContent: {
		flex: 1,
	},
	chatName: {
		fontSize: 16,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 2,
	},
	messageText: {
		fontSize: 14,
		color: COLORS.textSecondary,
	},
	chatMeta: {
		alignItems: 'flex-end',
		marginLeft: 10,
	},
	timeText: {
		fontSize: 12,
		color: COLORS.textSecondary,
	},
	unreadBadge: {
		backgroundColor: COLORS.accentGreen,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 4,
	},
	unreadText: {
		color: COLORS.buttonTextDark,
		fontSize: 12,
		fontWeight: 'bold',
		paddingHorizontal: 5,
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		color: COLORS.textSecondary,
		fontSize: 16,
	},
})

export default ChatListScreen
