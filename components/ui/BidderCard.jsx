import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../../constants/colors'

export default function BidderCard({ bid, onAssign, onDecline, onMessage }) {
	return (
		<View style={styles.bidderCard}>
			<View style={styles.bidderHeader}>
				<View style={[styles.avatar, styles.avatarPlaceholder]}>
					<Ionicons
						name='person-circle-outline'
						size={32}
						color={COLORS.textSecondary}
					/>
				</View>
				<View style={styles.bidderInfo}>
					<Text style={styles.bidderName} numberOfLines={1}>
						{bid.senderName || 'Unknown User'}
					</Text>
				</View>
			</View>

			<View style={styles.bidDetails}>
				<Text style={styles.bidAmountText}>Bid: ${bid.bidAmount}</Text>
				<Text style={styles.proposalMessage} numberOfLines={3}>
					"{bid.proposalMessage || 'Interested in this task.'}"
				</Text>
			</View>

			<View style={styles.actionRow}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => onAssign(bid)}
				>
					<Text style={styles.actionTextAssign}>Assign</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => onMessage(bid)}
				>
					<Text style={styles.actionTextMessage}>Message</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => onDecline(bid)}
				>
					<Text style={styles.actionTextDecline}>Decline</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	bidderCard: {
		backgroundColor: COLORS.card,
		borderRadius: 12,
		padding: 16,
		marginRight: 10,
		width: 260,
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 3,
		justifyContent: 'space-between',
	},
	bidderHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 12,
		backgroundColor: COLORS.border,
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	avatarPlaceholder: {},
	bidderInfo: {
		flex: 1,
	},
	bidderName: {
		fontSize: 17,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	bidDetails: {
		marginVertical: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
	},
	bidAmountText: {
		fontSize: 16,
		fontWeight: '700',
		color: COLORS.accentGreen,
		marginBottom: 8,
	},
	proposalMessage: {
		fontSize: 14,
		fontStyle: 'italic',
		color: COLORS.textSecondary,
		lineHeight: 20,
	},
	actionRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 12,
		borderTopWidth: 1,
		borderTopColor: COLORS.border,
		paddingTop: 12,
	},
	actionButton: {
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
	actionTextAssign: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.accentBlue,
	},
	actionTextMessage: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	actionTextDecline: {
		fontSize: 15,
		fontWeight: '600',
		color: COLORS.accentRed,
	},
})
