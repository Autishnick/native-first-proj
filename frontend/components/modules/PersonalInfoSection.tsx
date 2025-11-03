import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../../constants/colors'
import { formatDate, formatRole } from '../../utils/formatters'
import InfoRow from '../ui/InfoRow'

interface User {
	email?: string | null
}

interface Profile {
	displayName?: string | null
	role?: string | null
	createdAt?: unknown
}

interface PersonalInfoSectionProps {
	user: User | null
	profile: Profile | null
	updateUserProfile: (updates: { displayName: string }) => Promise<void>
}

export default function PersonalInfoSection({
	user,
	profile,
	updateUserProfile,
}: PersonalInfoSectionProps) {
	const [isEditMode, setIsEditMode] = useState<boolean>(false)
	const [displayName, setDisplayName] = useState<string>('')

	useEffect(() => {
		if (profile) {
			setDisplayName(profile.displayName || '')
		}
	}, [profile])

	const handleEditToggle = (): void => {
		const nextState = !isEditMode
		setIsEditMode(nextState)

		if (!nextState && profile) {
			setDisplayName(profile.displayName || '')
		}
	}

	const handleSaveChanges = async (): Promise<void> => {
		if (displayName.trim() === '') {
			Alert.alert('Error', 'Name cannot be empty.')
			return
		}
		try {
			await updateUserProfile({ displayName: displayName.trim() })
			Alert.alert('Success', 'Your profile has been updated.')
			setIsEditMode(false)
		} catch (error: unknown) {
			if (error instanceof Error) {
				Alert.alert('Error', error.message)
			} else {
				Alert.alert('Error', 'An unexpected error occurred.')
			}
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
					isLast={false}
				/>
				<InfoRow
					label='Email'
					value={user?.email || 'N/A'}
					isEditing={false}
					onChangeText={() => {}}
					isLast={false}
				/>
				<InfoRow
					label='User Type'
					value={formatRole(profile?.role)}
					isEditing={false}
					onChangeText={() => {}}
					isLast={false}
				/>
				<InfoRow
					label='Member Since'
					value={formatDate(profile?.createdAt)}
					isEditing={false}
					onChangeText={() => {}}
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
		overflow: 'hidden',
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
