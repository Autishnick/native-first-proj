import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import MessageBubble from '../../../components/ui/MessageBubble'
import { COLORS } from '../../../constants/colors'
import { useAuth } from '../../../hooks/useAuth'
import { useTaskMessages } from '../../../hooks/useTaskMessages'
import {
	createNotification,
	CreateNotificationParams,
} from '../../../utils/firebaseUtils' // Import type

interface Message {
	id: string
	senderId: string
	message: string
	createdAt?: Date
	[key: string]: any
}

interface AuthHookValue {
	userId: string | null | undefined
	userName: string | null | undefined
}

interface UseTaskMessagesReturn {
	messages: Message[]
	loading: boolean
}

export default function ChatDetailScreen() {
	const { TaskId, otherUserId, otherUserName } = useLocalSearchParams<{
		TaskId: string
		otherUserId: string
		otherUserName?: string
	}>()

	const navigation = useNavigation()
	const { userId, userName } = useAuth() as AuthHookValue

	const { messages, loading } = useTaskMessages(
		userId,
		TaskId
	) as UseTaskMessagesReturn

	const [inputText, setInputText] = useState<string>('')
	const [isSending, setIsSending] = useState<boolean>(false)
	const inputRef = useRef<TextInput>(null)

	const isChatReady = !!userId && !!TaskId && !!otherUserId

	useEffect(() => {
		if (otherUserName) {
			navigation.setOptions({ title: `${otherUserName}` })
		} else {
			navigation.setOptions({ title: 'Chat' })
		}
	}, [navigation, otherUserName, TaskId])

	useEffect(() => {
		if (isChatReady) {
			const timer = setTimeout(() => {
				inputRef.current?.focus()
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [isChatReady])

	const handleSendMessage = async (): Promise<void> => {
		if (!inputText.trim() || !isChatReady || isSending) return
		setIsSending(true)

		const messageToSend = inputText.trim()
		setInputText('')

		// Use CreateNotificationParams directly or ensure NotificationPayload matches
		const notificationData: CreateNotificationParams = {
			message: messageToSend,
			type: 'MESSAGE',
			senderId: userId as string,
			senderName: userName || 'User',
			recipientId: otherUserId,
			taskId: TaskId,
			recipientName: otherUserName || 'User', // Fallback ensures it's a string
			// bidAmount is optional in CreateNotificationParams, so omitting it is fine
		}

		try {
			await createNotification(notificationData)
		} catch (error) {
			console.error('Failed to send message:', error)
			alert('Error sending message.')
		} finally {
			setIsSending(false)
		}
	}

	const renderMessage = ({ item }: { item: Message }) => (
		<MessageBubble item={item} currentUserId={userId} />
	)

	if (loading && messages.length === 0) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (!isChatReady) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.errorText}>
					Chat is not configured correctly. Missing IDs.
				</Text>
				<Text style={styles.debugText}>UserId: {userId || 'null'}</Text>
				<Text style={styles.debugText}>TaskId: {TaskId || 'null'}</Text>
				<Text style={styles.debugText}>
					OtherUserId: {otherUserId || 'null'}
				</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
		>
			<FlatList
				data={messages}
				renderItem={renderMessage}
				keyExtractor={item => item.id}
				inverted={true}
				style={styles.messagesList}
				contentContainerStyle={{
					paddingVertical: 10,
					flexDirection: 'column-reverse',
				}}
			/>
			<View style={styles.inputContainer}>
				<TextInput
					ref={inputRef}
					style={[styles.input, { maxHeight: 100 }]}
					placeholder='Message'
					value={inputText}
					onChangeText={setInputText}
					multiline
				/>
				<TouchableOpacity
					style={[
						styles.sendButton,
						(!inputText.trim() || isSending) && styles.sendButtonDisabled,
					]}
					onPress={handleSendMessage}
					disabled={!inputText.trim() || isSending}
				>
					{isSending ? (
						<ActivityIndicator size='small' color={COLORS.buttonTextDark} />
					) : (
						<Text style={styles.sendButtonText}>Send</Text>
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
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
		padding: 20,
	},
	errorText: {
		color: 'red',
		fontSize: 16,
		textAlign: 'center',
		marginBottom: 10,
	},
	debugText: {
		color: COLORS.textSecondary,
		fontSize: 12,
		marginTop: 5,
	},
	messagesList: {
		flex: 1,
		paddingHorizontal: 10,
	},
	inputContainer: {
		flexDirection: 'row',
		padding: 10,
		backgroundColor: COLORS.card,
		alignItems: 'flex-end',
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	input: {
		flex: 1,
		backgroundColor: COLORS.background,
		borderRadius: 20,
		paddingHorizontal: 15,
		paddingTop: 10,
		paddingBottom: 10,
		color: COLORS.textPrimary,
		marginRight: 10,
		minHeight: 40,
		maxHeight: 100,
		fontSize: 16,
	},
	sendButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: COLORS.accentGreen,
		justifyContent: 'center',
		alignItems: 'center',
	},
	sendButtonDisabled: {
		backgroundColor: '#2b8a5a',
	},
	sendButtonText: {
		color: COLORS.buttonTextDark,
		fontWeight: 'bold',
		fontSize: 14,
	},
})
