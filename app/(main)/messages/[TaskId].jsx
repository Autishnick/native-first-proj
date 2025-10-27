import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useEffect, useState } from 'react'
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
import { useAuth } from '../../../hooks/useAuth'
import { useTaskMessages } from '../../../hooks/useTaskMessages'
import { createNotification } from '../../../utils/firebaseUtils'

const COLORS = {
	background: '#1A202C',
	card: '#2D3748',
	textPrimary: '#FFFFFF',
	textSecondary: '#9CA3AF',
	accentGreen: '#34D399',
	buttonTextDark: '#1A202C',
	border: '#4A5568',
}

export default function ChatDetailScreen() {
	const { taskId, otherUserId, otherUserName } = useLocalSearchParams()
	const navigation = useNavigation()
	const { userId, userName } = useAuth()
	const { messages, loading } = useTaskMessages(userId, taskId)
	const [inputText, setInputText] = useState('')
	const [isSending, setIsSending] = useState(false)
	const isChatReady = !!userId && !!taskId && !!otherUserId

	useEffect(() => {
		if (otherUserName) {
			navigation.setOptions({ title: `${otherUserName}` })
		} else {
			navigation.setOptions({ title: 'Chat' })
		}
	}, [navigation, otherUserName])

	const handleSendMessage = async () => {
		if (!inputText.trim() || !isChatReady || isSending) return
		setIsSending(true)
		const messageToSend = inputText.trim()
		setInputText('')
		const notificationData = {
			message: messageToSend,
			type: 'MESSAGE',
			senderId: userId,
			senderName: userName || 'User',
			recipientId: otherUserId,
			taskId: taskId,
			bidAmount: null,
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

	const renderMessage = ({ item }) => (
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
				extraData={messages.length}
			/>
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder={`Message ${otherUserName || 'user'}`}
					placeholderTextColor={COLORS.textSecondary}
					value={inputText}
					onChangeText={setInputText}
					multiline
					maxHeight={100}
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
	},
	errorText: {
		color: 'red',
		fontSize: 16,
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
