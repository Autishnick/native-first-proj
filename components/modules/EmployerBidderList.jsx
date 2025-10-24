// File: components/modules/EmployerBidderList.jsx
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
import { db } from '../../src/firebase/config' // Adjust path
import BidderCard from '../ui/BidderCard' // Import BidderCard

// Optional Hook to fetch bidders (can be kept inline if preferred)
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
				// Fetch bid notifications for this task addressed to the employer
				const q = query(
					collection(db, 'notifications'),
					where('taskId', '==', taskId),
					where('recipientId', '==', userId),
					where('type', '==', 'new_bid') // Filter only new_bid types
				)
				const snapshot = await getDocs(q)

				const bidNotifications = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))

				// Optional: Fetch additional user details if needed (like avatar)
				// This part can be simplified if senderName is always reliable
				const biddersPromises = bidNotifications.map(async bid => {
					// You might already have senderName in the bid notification
					// If not, fetch user doc (consider performance for many bids)
					// const userDocRef = doc(db, 'users', bid.senderId);
					// const userDoc = await getDoc(userDocRef);
					// const userData = userDoc.exists() ? userDoc.data() : {};
					return {
						...bid,
						proposalMessage: bid.message, // Assuming message is the proposal
						// avatarUrl: userData.avatarUrl || null,
					}
				})

				const combinedBidders = await Promise.all(biddersPromises)
				setBidders(combinedBidders)
			} catch (error) {
				console.error('Error fetching bids and user details:', error)
				// Handle error state if needed
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
					contentContainerStyle={{ paddingRight: 16 }} // Ensure last card isn't cut off
				>
					{bidders.map(bid => (
						<BidderCard
							key={bid.id} // Use notification ID as key
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
		paddingTop: 16, // Reduced top padding
		paddingBottom: 34, // Safe area
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		marginTop: 'auto', // Push to bottom
	},
	bidLabel: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 15, // Increased margin
		paddingHorizontal: 16, // Add horizontal padding to label
	},
	horizontalScroll: {
		// marginHorizontal removed, padding added below
		paddingLeft: 16, // Start padding for the first card
	},
	noBidsText: {
		color: COLORS.textSecondary,
		fontStyle: 'italic',
		marginTop: 10,
		textAlign: 'center',
		paddingHorizontal: 16,
	},
})
