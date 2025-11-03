import { collection, getDocs, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'
import { db } from '../../src/firebase/config'
import { Bidder, BidNotificationData } from '../../types/task.types'
import BidderCard from '../ui/BidderCard'

interface UseTaskBiddersReturn {
	bidders: Bidder[]
	loading: boolean
}

const useTaskBidders = (
	taskId: string,
	userId: string
): UseTaskBiddersReturn => {
	const [bidders, setBidders] = useState<Bidder[]>([])
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		if (!taskId || !userId) {
			setLoading(false)
			setBidders([])
			return
		}

		const fetchBids = async () => {
			setLoading(true)
			try {
				// Тепер можна використовувати всі 3 where, бо індекс готовий
				const q = query(
					collection(db, 'notifications'),
					where('recipientId', '==', userId),
					where('taskId', '==', taskId),
					where('type', '==', 'BID')
				)
				const snapshot = await getDocs(q)

				console.log('Found bid notifications:', snapshot.size)

				const bidNotifications = snapshot.docs.map(doc => ({
					id: doc.id,
					...(doc.data() as BidNotificationData),
				}))

				const biddersData: Bidder[] = bidNotifications.map(bid => ({
					...bid,
					workerId: bid.senderId,
					workerName: bid.senderName,
					proposalMessage: bid.message,
					createdAt: bid.createdAt ?? new Date().toISOString(),
				}))

				setBidders(biddersData)
			} catch (error) {
				console.error('Error fetching bids:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchBids()
	}, [taskId, userId])

	return { bidders, loading }
}

interface EmployerBidderListProps {
	taskId: string
	userId: string
	onAssign: (bid: Bidder) => void
	onDecline: (bid: Bidder) => void
	onMessage: (bid: Bidder) => void
}

const EmployerBidderList: React.FC<EmployerBidderListProps> = ({
	taskId,
	userId,
	onAssign,
	onDecline,
	onMessage,
}) => {
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

export default EmployerBidderList

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
