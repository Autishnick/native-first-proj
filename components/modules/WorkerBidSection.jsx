import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { COLORS } from '../../constants/colors'

export default function WorkerBidSection({
	task,
	userId,
	userName,
	onSubmitBid,
}) {
	const initialBidPrice = '0'
	const [editing, setEditing] = useState(false)
	const [bidPrice, setBidPrice] = useState(initialBidPrice)
	const [tempBidPrice, setTempBidPrice] = useState(initialBidPrice)
	const [submitting, setSubmitting] = useState(false)

	useEffect(() => {
		setBidPrice(initialBidPrice)
		setTempBidPrice(initialBidPrice)
		setEditing(false)
		setSubmitting(false)
	}, [task?.id])

	const handleBidPriceChange = text => {
		const newText = text.replace(/[^0-9]/g, '')
		setTempBidPrice(newText)
	}

	const handleEdit = () => {
		if (!editing) setTempBidPrice(bidPrice)
		setEditing(true)
	}

	const handleSave = () => {
		const finalPrice = tempBidPrice === '' ? '0' : tempBidPrice
		setBidPrice(finalPrice)
		setEditing(false)
	}

	const handleCancel = () => {
		setTempBidPrice(bidPrice)
		setEditing(false)
	}

	const handleSubmit = async () => {
		const currentBid = parseInt(bidPrice)
		if (isNaN(currentBid) || currentBid <= 0) {
			Alert.alert('Error', 'Please enter a valid bid amount greater than 0')
			return
		}
		if (!task) {
			Alert.alert('Error', 'No task selected')
			return
		}
		if (task.createdBy === userId) {
			Alert.alert('Error', 'You cannot place a bid on your own task.')
			return
		}

		setSubmitting(true)
		setEditing(false)

		try {
			await onSubmitBid({
				taskCreatorId: task.createdBy,
				taskId: task.id,
				bidAmount: currentBid,
				type: 'new_bid',
				message: `I am interested in this task.`,
			})
		} catch (error) {
			console.error('WorkerBidSection: Error during submission:', error)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View style={styles.bidSection}>
			<View style={styles.bidHeader}>
				<Text style={styles.bidLabel}>Your Bid Price</Text>
				<TouchableOpacity
					style={styles.editButton}
					onPress={editing ? handleCancel : handleEdit}
					disabled={submitting}
				>
					<Ionicons
						name={editing ? 'close-circle-outline' : 'pencil'}
						size={18}
						color={COLORS.buttonTextDark}
					/>
					<Text style={styles.editText}>{editing ? 'Cancel' : 'Edit'}</Text>
				</TouchableOpacity>
			</View>

			{editing ? (
				<>
					<TextInput
						style={styles.input}
						keyboardType='numeric'
						value={tempBidPrice}
						onChangeText={handleBidPriceChange}
						autoFocus={true}
					/>
					<View style={styles.controlButtonContainer}>
						<TouchableOpacity
							style={[styles.controlButton, styles.saveButton]}
							onPress={handleSave}
						>
							<Text style={styles.controlButtonText}>Save</Text>
						</TouchableOpacity>
					</View>
				</>
			) : (
				<Text style={styles.bidValue}>${bidPrice}</Text>
			)}

			{!editing && (
				<TouchableOpacity
					style={[
						styles.submitButton,
						submitting && styles.submitButtonDisabled,
					]}
					onPress={handleSubmit}
					disabled={submitting || bidPrice === '0'}
				>
					<Text style={styles.submitText}>
						{submitting ? 'Submitting...' : 'Submit Bid'}
					</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	bidSection: {
		backgroundColor: COLORS.bidSection,
		padding: 16,
		paddingBottom: 34,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		marginTop: 'auto',
	},
	bidHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	bidLabel: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: '600',
	},
	editButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.textPrimary,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 10,
	},
	editText: {
		marginLeft: 5,
		color: COLORS.buttonTextDark,
		fontWeight: '500',
	},
	bidValue: {
		fontSize: 30,
		color: COLORS.accentGreen,
		fontWeight: '700',
		marginVertical: 10,
	},
	input: {
		fontSize: 30,
		color: COLORS.accentGreen,
		fontWeight: '700',
		marginVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: COLORS.accentGreen,
		paddingBottom: 5,
	},
	submitButton: {
		backgroundColor: COLORS.accentGreen,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		marginTop: 20,
	},
	submitButtonDisabled: {
		backgroundColor: COLORS.border,
		opacity: 0.8,
	},
	submitText: {
		fontSize: 18,
		fontWeight: '600',
		color: COLORS.buttonTextDark,
	},
	controlButtonContainer: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 10,
	},
	controlButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 10,
		alignItems: 'center',
		marginLeft: 10,
	},
	saveButton: {
		backgroundColor: COLORS.accentGreen,
	},
	controlButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.buttonTextDark,
	},
})
