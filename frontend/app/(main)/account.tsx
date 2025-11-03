import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { router } from 'expo-router'
import { useState } from 'react'
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'

import PasswordChangeSection from '../../components/modules/PasswordChangeSection'
import PersonalInfoSection from '../../components/modules/PersonalInfoSection'
import { COLORS } from '../../constants/colors'
import { useAuth } from '../../hooks/useAuthContext'
import { api } from '../../src/api/client'

// Define types for mutation data
interface UpdateProfileData {
	displayName: string
	// Add other fields that can be updated
}

interface ChangePasswordData {
	currentPassword: string
	newPassword: string
}

export default function AccountScreen() {
	const { user, profile, loading: authLoading } = useAuth()
	const queryClient = useQueryClient()
	const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
		useState(false)

	// Mutation for updating user profile
	const {
		mutateAsync: updateProfileMutate,
		// We keep this hook even if not passed down,
		// in case you want to add a top-level loader later
		isPending: isUpdatingProfile,
	} = useMutation<void, AxiosError, UpdateProfileData>({
		mutationFn: (profileData: UpdateProfileData) =>
			api.patch('/profile', profileData),
		onSuccess: () => {
			Alert.alert('Success', 'Profile updated successfully.')
			// Invalidate the profile query to refetch data
			if (user) {
				queryClient.invalidateQueries({ queryKey: ['profile', user.uid] })
			}
		},
		onError: (err: AxiosError) => {
			const errorMsg =
				(err.response?.data as any)?.message || 'Failed to update profile.'
			Alert.alert('Error', errorMsg)
		},
	})

	// Mutation for changing password
	const {
		mutateAsync: changePasswordMutate,
		// We keep this hook even if not passed down
		isPending: isChangingPassword,
	} = useMutation<void, AxiosError, ChangePasswordData>({
		mutationFn: (passwordData: ChangePasswordData) =>
			api.post('/auth/change-password', passwordData),
		onSuccess: () => {
			Alert.alert('Success', 'Your password has been changed successfully.')
			setIsPasswordSectionVisible(false)
		},
		onError: (err: AxiosError) => {
			const errorMsg =
				(err.response?.data as any)?.message || 'Password change failed.'
			Alert.alert('Error', errorMsg)
		},
	})

	const handlePasswordChangeSubmit = async (
		currentPassword: string,
		newPassword: string
	) => {
		// Prevent double-submission if already changing
		if (isChangingPassword) return
		try {
			await changePasswordMutate({ currentPassword, newPassword })
		} catch (error) {
			// Error is already handled by the mutation's onError
			console.error('Password change error:', error)
		}
	}

	const handleProfileUpdateSubmit = async (data: UpdateProfileData) => {
		// Prevent double-submission if already updating
		if (isUpdatingProfile) return
		try {
			await updateProfileMutate(data)
		} catch (error) {
			// Error is already handled by the mutation's onError
			console.error('Profile update error:', error)
		}
	}

	const togglePasswordSection = () => {
		setIsPasswordSectionVisible(!isPasswordSectionVisible)
	}

	if (authLoading) {
		return (
			<View style={[styles.mainContainer, styles.centered]}>
				<ActivityIndicator size='large' color={COLORS.accentGreen} />
			</View>
		)
	}

	if (!user) {
		return (
			<View style={[styles.mainContainer, styles.centered, { padding: 25 }]}>
				<Text style={styles.title}>My Account</Text>
				<Text style={styles.subtitle}>
					You need to login to view your account details
				</Text>
				<TouchableOpacity
					style={styles.loginButton}
					onPress={() => router.replace('/(auth)/login')}
				>
					<Text style={styles.loginButtonText}>Log In</Text>
				</TouchableOpacity>
				<View style={styles.linkContainer}>
					<Text style={styles.subtitle}>Don't have an account? </Text>
					<TouchableOpacity onPress={() => router.push('/(auth)/register')}>
						<Text style={styles.link}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	return (
		<View style={styles.mainContainer}>
			<ScrollView style={styles.scrollContainer}>
				<PersonalInfoSection
					user={user}
					profile={profile}
					updateUserProfile={handleProfileUpdateSubmit}
				/>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account Security</Text>
					<TouchableOpacity
						style={styles.actionButton}
						onPress={togglePasswordSection}
					>
						<Text style={styles.actionButtonText}>
							{isPasswordSectionVisible
								? 'Hide Password Section'
								: 'Change Password'}
						</Text>
					</TouchableOpacity>
					{isPasswordSectionVisible && (
						<PasswordChangeSection
							onChangePassword={handlePasswordChangeSubmit}
							onCancel={togglePasswordSection}
						/>
					)}
				</View>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	scrollContainer: {
		paddingHorizontal: 20,
		paddingTop: 30,
		paddingBottom: 50,
	},
	centered: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: COLORS.textPrimary,
		marginBottom: 5,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: COLORS.textSecondary,
		textAlign: 'center',
		marginBottom: 20,
	},
	section: {
		marginBottom: 30,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: COLORS.textPrimary,
		marginBottom: 15,
	},
	loginButton: {
		backgroundColor: COLORS.accentGreen,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 30,
		width: '100%',
	},
	loginButtonText: {
		color: COLORS.textPrimary,
		fontSize: 18,
		fontWeight: 'bold',
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 20,
	},
	link: {
		color: COLORS.link,
		fontWeight: 'bold',
		fontSize: 16,
	},
	actionButton: {
		backgroundColor: COLORS.actionButtonBg,
		padding: 15,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 15,
	},
	actionButtonText: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '500',
	},
})
