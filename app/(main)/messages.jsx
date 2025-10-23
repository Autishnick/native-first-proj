import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import {
	markNotificationAsRead,
	subscribeToNotifications,
} from '../../utils/firebaseUtils'

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

export default function NotificationsScreen() {
	const { userId } = useAuth()
	const [notifications, setNotifications] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setLoading(true)
		if (!userId) {
			setLoading(false)
			return
		}

		const unsubscribe = subscribeToNotifications(
			userId,
			newNotifications => {
				setNotifications(newNotifications)
				setLoading(false)
			},
			error => {
				console.error('Error listening to notifications:', error)
				setLoading(false)
			}
		)

		return () => unsubscribe()
	}, [userId])

	const handlePress = async item => {
		if (!item.read) {
			await markNotificationAsRead(item.id)
		}
		// 2. ⚠️ Logic to navigate to TaskDetailScreen (using Expo Router) should be here
		// router.push(`/(main)/task/${item.taskId}`);
	}

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={[styles.item, item.read ? styles.read : styles.unread]}
			onPress={() => handlePress(item)}
		>
			<Text style={styles.messageText}>
				<Text style={{ fontWeight: item.read ? 'normal' : '700' }}>
					{item.senderName}
				</Text>
				{item.type === 'NEW_BID' ? ' made a new bid: ' : item.message}
			</Text>
			<Text style={styles.bidAmount}>${item.bidAmount}</Text>
			<Text style={styles.timeText}>
				{item.createdAt?.toDate().toLocaleTimeString()}
			</Text>
		</TouchableOpacity>
	)

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
				data={notifications}
				renderItem={renderItem}
				keyExtractor={item => item.id}
				ListEmptyComponent={
					<Text style={styles.emptyText}>No notifications yet.</Text>
				}
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
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	unread: {
		backgroundColor: COLORS.unreadBackground, // Darker card for unread
	},
	read: {
		backgroundColor: COLORS.readBackground, // Standard card background for read
	},
	messageText: {
		flex: 2,
		fontSize: 16,
		color: COLORS.textPrimary, // White text
	},
	bidAmount: {
		fontWeight: 'bold',
		color: COLORS.accentGreen, // Accent green for bid amount
		marginHorizontal: 10,
		fontSize: 16,
	},
	timeText: {
		fontSize: 10,
		color: COLORS.textSecondary, // Light gray for time
		marginLeft: 'auto',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		color: COLORS.textSecondary, // Light gray for empty state
		fontSize: 16,
	},
})
