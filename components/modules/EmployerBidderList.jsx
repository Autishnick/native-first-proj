import { collection, getDocs, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import { db } from '../../src/firebase/config'
import BidderCard from '../ui/BidderCard'

const useTaskBidders = (taskId, userId) => {
	const [bidders, setBidders] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!taskId || !userId) {
			setLoading(false)
			setBidders([])
			return
		}

		const fetchBids = async () => {
			setLoading(true)
			try {
				const q = query(
					collection(db, 'notifications'),
					where('taskId', '==', taskId),
					where('recipientId', '==', userId),
					where('type', '==', 'new_bid')
				)
				const snapshot = await getDocs(q)

				const bidNotifications = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))

				const biddersPromises = bidNotifications.map(async bid => {
					return {
						...bid,
						proposalMessage: bid.message,
					}
				})

				const combinedBidders = await Promise.all(biddersPromises)
				setBidders(combinedBidders)
			} catch (error) {
				console.error('Error fetching bids and user details:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchBids()
	}, [taskId, userId])

	return { bidders, loading }
}

export default function EmployerBidderList({
	taskId,
	userId,
	onAssign,
	onDecline,
	onMessage,
}) {
	const { bidders, loading } = useTaskBidders(taskId, userId)

	return (
		<View style={styles.bidSection}>
			<Text style={styles.bidLabel}>Workers who applied:</Text>
			{loading ? (
				<ActivityIndicator
					color={COLORS.accentGreen}
					style={{ marginTop: 20 }}
				/>
			) : bidders.length > 0 ? (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={styles.horizontalScroll}
					contentContainerStyle={{ paddingRight: 16 }}
				>
					{bidders.map(bid => (
						<BidderCard
							key={bid.id}
							bid={bid}
							onAssign={onAssign}
							onDecline={onDecline}
							onMessage={onMessage}
						/>
					))}
				</ScrollView>
			) : (
				<Text style={styles.noBidsText}>No bids submitted yet.</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	bidSection: {
		backgroundColor: COLORS.bidSection,
		paddingTop: 16,
		paddingBottom: 34,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		marginTop: 'auto',
	},
	bidLabel: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 15,
		paddingHorizontal: 16,
	},
	horizontalScroll: {
		paddingLeft: 16,
	},
	noBidsText: {
		color: COLORS.textSecondary,
		fontStyle: 'italic',
		marginTop: 10,
		textAlign: 'center',
		paddingHorizontal: 16,
	},
})
