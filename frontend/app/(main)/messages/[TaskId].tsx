import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
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
import { useAuth } from '../../../hooks/useAuthContext'
import { api } from '../../../src/api/client'

interface Message {
	id: string
	senderId: string
	text: string
	createdAt?: Date | string
	type?: 'MESSAGE' | 'SYSTEM'
	[key: string]: any
}

interface SendMessagePayload {
	text: string
}

interface OptimisticMessageContext {
	previousMessages: Message[]
}

export default function ChatDetailScreen() {
	const { TaskId, chatTitle } = useLocalSearchParams<{
		TaskId: string
		chatTitle?: string
	}>()

	const chatId = TaskId

	const navigation = useNavigation()
	const router = useRouter()
	const { user } = useAuth()
	const queryClient = useQueryClient()
	const userId = user?.uid
	const [inputText, setInputText] = useState<string>('')
	const inputRef = useRef<TextInput>(null)

	const isChatReady = !!userId && !!chatId

	const {
		data: messages = [],
		isLoading: messagesLoading,
		error,
	} = useQuery<Message[], AxiosError>({
		queryKey: ['messages', chatId],
		queryFn: async () => {
			const { data } = await api.get(`/chats/${chatId}/messages`)
			return data
		},
		enabled: isChatReady,
		refetchInterval: 5000,
	})

	const { mutate: sendMessage, isPending: isSending } = useMutation<
		Message,
		AxiosError,
		SendMessagePayload,
		OptimisticMessageContext
	>({
		mutationFn: payload => api.post(`/chats/${chatId}/messages`, payload),

		onMutate: async newMessage => {
			await queryClient.cancelQueries({ queryKey: ['messages', chatId] })

			const previousMessages =
				queryClient.getQueryData<Message[]>(['messages', chatId]) || []

			const optimisticMessage: Message = {
				id: `temp-${Date.now()}`,
				senderId: userId as string,
				text: newMessage.text,
				createdAt: new Date(),
				type: 'MESSAGE',
			}

			queryClient.setQueryData<Message[]>(['messages', chatId], (old = []) => [
				optimisticMessage,
				...old,
			])

			return { previousMessages }
		},

		onError: (err, newMessage, context) => {
			if (context?.previousMessages) {
				queryClient.setQueryData(['messages', chatId], context.previousMessages)
			}
			console.error('Failed to send message:', err)
			alert('Error sending message.')
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['messages', chatId] })
		},
	})

	useEffect(() => {
		navigation.setOptions({
			title: chatTitle ? `${chatTitle}` : 'Chat',
			headerLeft: () => (
				<TouchableOpacity
					onPress={() => router.push('/messages')}
					style={styles.backButton}
				>
					<Ionicons name='arrow-back' size={24} color={COLORS.textPrimary} />
				</TouchableOpacity>
			),
		})
	}, [navigation, chatTitle, router])

	useEffect(() => {
		if (isChatReady) {
			const timer = setTimeout(() => {
				inputRef.current?.focus()
			}, 100)
			return () => clearTimeout(timer)
		}
	}, [isChatReady])

	const handleSendMessage = (): void => {
		if (!inputText.trim() || !isChatReady || isSending) return

		const messageToSend = inputText.trim()
		setInputText('')

		sendMessage({ text: messageToSend })
	}

	const renderMessage = ({ item }: { item: Message }) => {
		const messageItem = {
			...item,
			message: item.text,
			createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
		}
		return <MessageBubble item={messageItem} currentUserId={userId} />
	}

	if (messagesLoading && messages.length === 0) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (error) {
		return (
			<View style={styles.loadingContainer}>
				<Text style={styles.errorText}>
					Error loading messages: {error.message}
				</Text>
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
				<Text style={styles.debugText}>
					ChatId (from TaskId): {chatId || 'null'}
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
	backButton: {
		marginLeft: 10,
		padding: 5,
	},
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
