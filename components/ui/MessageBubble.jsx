// File: components/ui/MessageBubble.jsx
import { StyleSheet, Text, View } from 'react-native'

import { COLORS } from '../../constants/colors'

export default function MessageBubble({ item, currentUserId }) {
	const isMyMessage = item.senderId === currentUserId

	// Не рендеримо, якщо немає тексту повідомлення
	if (!item.message) {
		return null
	}

	return (
		<View
			style={[
				styles.messageBubble,
				isMyMessage ? styles.myMessage : styles.theirMessage,
			]}
		>
			<Text style={styles.messageText}>{item.message}</Text>
			<Text
				style={[
					styles.messageTime,
					isMyMessage ? styles.myTime : styles.theirTime,
				]}
			>
				{item.createdAt
					? item.createdAt.toLocaleTimeString([], {
							// Використовуємо Date об'єкт
							hour: '2-digit',
							minute: '2-digit',
					  })
					: '...'}
			</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	messageBubble: {
		borderRadius: 15,
		paddingVertical: 8,
		paddingHorizontal: 12,
		marginVertical: 4,
		maxWidth: '80%',
		flexDirection: 'column',
	},
	myMessage: {
		alignSelf: 'flex-end',
		backgroundColor: COLORS.accentGreen,
		borderBottomRightRadius: 2,
	},
	theirMessage: {
		alignSelf: 'flex-start',
		backgroundColor: COLORS.card,
		borderBottomLeftRadius: 2,
	},
	messageText: {
		color: COLORS.buttonTextDark,
		fontSize: 15,
		marginBottom: 3,
	},
	messageTime: {
		fontSize: 10,
		alignSelf: 'flex-end',
	},
	myTime: {
		color: COLORS.buttonTextDark,
		opacity: 0.7,
	},
	theirTime: {
		color: COLORS.textSecondary,
		opacity: 0.8,
	},
})
