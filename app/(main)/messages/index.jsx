// File: app/(main)/messages/index.jsx
import { Ionicons } from '@expo/vector-icons' // Для іконок
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import {
	ActivityIndicator,
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../../hooks/useAuth'

// ❗️ ВАЖЛИВО: Нам потрібен хук, щоб отримувати
// ВСІ сповіщення (вхідні ТА вихідні) для списку чатів.
// Ми не можемо використовувати старий subscribeToNotifications,
// тому ми беремо логіку з useTaskMessages і адаптуємо її.
import { useChatList } from '../../../hooks/useChatList' // 👈 Ми створимо цей хук (Крок 2)

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	unreadBackground: '#374151',
	readBackground: '#2D3748',
	border: '#4A5568',
}

export default function ChatListScreen() {
	const { userId } = useAuth()
	const router = useRouter()

	// 1. Використовуємо новий хук, щоб отримати ВСІ повідомлення
	const { messages: allMessages, loading } = useChatList(userId)

	// 2. Логіка групування повідомлень в чати
	const chatGroups = useMemo(() => {
		if (!allMessages || allMessages.length === 0) {
			return []
		}

		// Групуємо повідомлення за taskId
		const groups = new Map()

		allMessages.forEach(msg => {
			// Визначаємо унікальний ключ для чату (за завданням)
			const chatId = msg.taskId
			if (!chatId) return // Ігноруємо повідомлення без taskId

			// Визначаємо, хто є співрозмовником
			const otherPersonId =
				msg.senderId === userId ? msg.recipientId : msg.senderId
			const otherPersonName =
				msg.senderId === userId ? msg.recipientName : msg.senderName // Потрібно додати recipientName при створенні

			if (!groups.has(chatId)) {
				// Якщо це перший раз, коли ми бачимо цей чат
				groups.set(chatId, {
					chatId: chatId,
					otherUserId: otherPersonId,
					otherUserName: otherPersonName || 'Chat',
					lastMessage: msg, // Поки що це останнє повідомлення
					unreadCount: 0,
				})
			} else {
				// Якщо чат вже існує, оновлюємо останнє повідомлення
				const chat = groups.get(chatId)
				if (msg.createdAt?.toDate() > chat.lastMessage.createdAt?.toDate()) {
					chat.lastMessage = msg
				}
			}

			// Рахуємо непрочитані (тільки ті, що прийшли нам)
			if (!msg.read && msg.recipientId === userId) {
				groups.get(chatId).unreadCount++
			}
		})

		// Конвертуємо Map в масив і сортуємо (новіші чати зверху)
		return Array.from(groups.values()).sort(
			(a, b) =>
				b.lastMessage.createdAt?.toDate() - a.lastMessage.createdAt?.toDate()
		)
	}, [allMessages, userId])

	// 3. Функція переходу до детального чату
	const handlePressChat = chat => {
		router.push({
			pathname: `/messages/${chat.chatId}`, // Перехід на [TaskId].jsx
			params: {
				taskId: chat.chatId,
				otherUserId: chat.otherUserId,
				otherUserName: chat.otherUserName,
			},
		})
	}

	// 4. Рендер елемента списку (окремого чату)
	const renderChatItem = ({ item: chat }) => {
		const lastMsg = chat.lastMessage
		const isMyLastMessage = lastMsg.senderId === userId
		const time =
			lastMsg.createdAt?.toDate()?.toLocaleTimeString([], {
				hour: '2-digit',
				minute: '2-digit',
			}) || ''

		return (
			<TouchableOpacity
				style={[styles.item, chat.unreadCount > 0 && styles.unread]}
				onPress={() => handlePressChat(chat)}
			>
				<View style={styles.avatar}>
					<Ionicons
						name='chatbubbles-outline'
						size={24}
						color={COLORS.accentGreen}
					/>
				</View>
				<View style={styles.chatContent}>
					<Text style={styles.chatName}>{chat.otherUserName}</Text>
					<Text style={styles.messageText} numberOfLines={1}>
						{isMyLastMessage ? 'You: ' : ''}
						{lastMsg.type === 'NEW_BID'
							? `Sent a bid: $${lastMsg.bidAmount}`
							: lastMsg.message}
					</Text>
				</View>
				<View style={styles.chatMeta}>
					<Text style={styles.timeText}>{time}</Text>
					{chat.unreadCount > 0 && (
						<View style={styles.unreadBadge}>
							<Text style={styles.unreadText}>{chat.unreadCount}</Text>
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
			<FlatList
				data={chatGroups}
				renderItem={renderChatItem}
				keyExtractor={item => item.chatId}
				ListEmptyComponent={<Text style={styles.emptyText}>No chats yet.</Text>}
			/>
		</View>
	)
}

// Нові стилі для списку чатів
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
		marginBottom: 5,
	},
	unreadBadge: {
		backgroundColor: COLORS.accentGreen,
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	unreadText: {
		color: COLORS.buttonTextDark,
		fontSize: 12,
		fontWeight: 'bold',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		color: COLORS.textSecondary,
		fontSize: 16,
	},
})
