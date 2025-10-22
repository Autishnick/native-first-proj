import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	FlatList,
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

		return () => unsubscribe() // Відписка при демонтажі
	}, [userId])

	const handlePress = async item => {
		// 1. Позначити як прочитане, якщо ще не прочитане
		if (!item.read) {
			await markNotificationAsRead(item.id)
		}
		// 2. ⚠️ Тут має бути логіка переходу до TaskDetailScreen (використовуючи Expo Router)
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
		return <ActivityIndicator size='large' style={styles.loading} />
	}

	return (
		<View style={styles.container}>
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
	item: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	unread: {
		backgroundColor: '#e0f7fa', // Світло-блакитний для нових
	},
	read: {
		backgroundColor: '#fff',
	},
	messageText: {
		flex: 2,
		fontSize: 16,
	},
	bidAmount: {
		fontWeight: 'bold',
		color: '#1DFE79',
		marginHorizontal: 10,
	},
	timeText: {
		fontSize: 10,
		color: '#888',
		marginLeft: 'auto',
	},
	loading: {
		flex: 1,
		justifyContent: 'center',
	},
	emptyText: {
		textAlign: 'center',
		marginTop: 50,
		color: '#888',
	},
})
