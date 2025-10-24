// File: components/modules/PersonalInfoSection.jsx
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { formatDate, formatRole } from '../../utils/formatters' // Використовуємо винесені функції
import InfoRow from '../ui/InfoRow' // Використовуємо винесений компонент

import { COLORS } from '../../constants/colors'

export default function PersonalInfoSection({
	user,
	profile,
	updateUserProfile,
}) {
	const [isEditMode, setIsEditMode] = useState(false)
	const [displayName, setDisplayName] = useState('')

	useEffect(() => {
		if (profile) {
			setDisplayName(profile.displayName || '')
		}
	}, [profile])

	const handleEditToggle = () => {
		const nextState = !isEditMode
		setIsEditMode(nextState)
		// Якщо виходимо з режиму редагування, скидаємо ім'я
		if (!nextState && profile) {
			setDisplayName(profile.displayName || '')
		}
	}

	const handleSaveChanges = async () => {
		if (displayName.trim() === '') {
			Alert.alert('Error', 'Name cannot be empty.')
			return
		}
		try {
			await updateUserProfile({ displayName: displayName.trim() })
			Alert.alert('Success', 'Your profile has been updated.')
			setIsEditMode(false) // Виходимо з режиму редагування
		} catch (error) {
			Alert.alert('Error', error.message)
		}
	}

	return (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionTitle}>Personal Information</Text>
				<TouchableOpacity style={styles.editButton} onPress={handleEditToggle}>
					<Text style={styles.editButtonText}>
						{isEditMode ? 'Cancel' : 'Edit'}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.infoBox}>
				<InfoRow
					label='Name'
					value={displayName}
					isEditing={isEditMode}
					onChangeText={setDisplayName}
				/>
				<InfoRow label='Email' value={user?.email || 'N/A'} />
				<InfoRow label='User Type' value={formatRole(profile?.role)} />
				<InfoRow
					label='Member Since'
					value={formatDate(profile?.createdAt)}
					isLast={true}
				/>
			</View>
			{isEditMode && (
				<TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
					<Text style={styles.saveButtonText}>Save Changes</Text>
				</TouchableOpacity>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	section: {
		marginBottom: 30,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: COLORS.textPrimary,
	},
	editButton: {
		borderWidth: 1,
		borderColor: COLORS.editButtonBorder,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
	},
	editButtonText: {
		fontSize: 14,
		color: COLORS.editButtonText,
		fontWeight: '500',
	},
	infoBox: {
		backgroundColor: COLORS.card,
		borderRadius: 10,
		borderColor: COLORS.infoBoxBorder,
		borderWidth: 1,
		overflow: 'hidden', // Щоб лінії не виходили за межі
	},
	saveButton: {
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 20,
	},
	saveButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: 'bold',
	},
})
