import {
	createUserWithEmailAndPassword,
	EmailAuthProvider,
	User as FirebaseUser,
	onAuthStateChanged,
	reauthenticateWithCredential,
	signInWithEmailAndPassword,
	signOut,
	updatePassword,
	updateProfile,
	UserCredential,
} from 'firebase/auth'

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

export interface UserProfile {
	uid: string
	email: string
	role: 'employer' | 'worker' | 'admin' | string
	displayName: string
	createdAt?: string
	[key: string]: any
}

export interface UseAuthReturn {
	user: FirebaseUser | null
	profile: UserProfile | null
	loading: boolean
	register: (
		email: string,
		password: string,
		role: string,
		displayName?: string
	) => Promise<FirebaseUser>
	login: (email: string, password: string) => Promise<UserCredential>
	logout: () => Promise<void>
	updateUserProfile: (newProfileData: Partial<UserProfile>) => Promise<void>
	changeUserPassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<boolean>

	userId: string | null
	userName: string | null
	isAuthenticated: boolean
	isEmployer: boolean
	isWorker: boolean
}

export const useAuth = (): UseAuthReturn => {
	const [user, setUser] = useState<FirebaseUser | null>(null)
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	const fetchUserProfile = async (uid: string): Promise<void> => {
		console.log('📖 Fetching profile for UID:', uid)
		if (!uid) {
			setProfile(null)
			return
		}
		try {
			const userRef = doc(db, 'users', uid)
			const docSnap = await getDoc(userRef)
			if (docSnap.exists()) {
				console.log('✅ Profile found:', docSnap.data())
				setProfile(docSnap.data() as UserProfile)
			} else {
				console.warn('⚠️ User profile not found in Firestore.')
				setProfile(null)
			}
		} catch (error) {
			console.error('❌ Error fetching user profile:', error)
			setProfile(null)
		}
	}

	useEffect(() => {
		console.log('🔄 Setting up auth listener...')
		const unsubscribe = onAuthStateChanged(auth, async authUser => {
			console.log('🔔 Auth state changed:', authUser?.email || 'No user')
			setUser(authUser)
			if (authUser) {
				await fetchUserProfile(authUser.uid)
			} else {
				setProfile(null)
			}
			setLoading(false)
		})
		return () => unsubscribe()
	}, [])

	const register = async (
		email: string,
		password: string,
		role: string,
		displayName = 'User'
	): Promise<FirebaseUser> => {
		try {
			console.log('🚀 Registering:', email)
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			)
			const authUser = userCredential.user

			await updateProfile(authUser, { displayName })

			const userDocRef = doc(db, 'users', authUser.uid)
			const profileData: UserProfile = {
				uid: authUser.uid,
				email: authUser.email ?? '',
				role,
				displayName,
				createdAt: new Date().toISOString(),
			}

			await setDoc(userDocRef, profileData)
			setProfile(profileData)
			return authUser
		} catch (error: any) {
			console.error('❌ Registration error:', error)
			switch (error.code) {
				case 'auth/email-already-in-use':
					throw new Error('This email is already registered.')
				case 'auth/invalid-email':
					throw new Error('Invalid email address.')
				case 'auth/weak-password':
					throw new Error('Password should be at least 6 characters.')
				default:
					throw new Error(error.message || 'Registration failed.')
			}
		}
	}

	const login = async (
		email: string,
		password: string
	): Promise<UserCredential> => {
		console.log('🔑 Attempting login:', email)
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			)
			console.log('✅ Login successful:', userCredential.user.uid)
			return userCredential
		} catch (error: any) {
			console.error('❌ Login error:', error)
			switch (error.code) {
				case 'auth/user-not-found':
					throw new Error('No account found with this email.')
				case 'auth/wrong-password':
					throw new Error('Incorrect password.')
				case 'auth/invalid-email':
					throw new Error('Invalid email address.')
				case 'auth/invalid-credential':
					throw new Error('Invalid email or password.')
				default:
					throw new Error(error.message || 'Login failed.')
			}
		}
	}

	const logout = async (): Promise<void> => {
		console.log('👋 Logging out...')
		try {
			await signOut(auth)
			setUser(null)
			setProfile(null)
			console.log('✅ Logout successful')
		} catch (error) {
			console.error('❌ Logout error:', error)
			throw new Error('Failed to logout.')
		}
	}

	const updateUserProfile = async (
		newProfileData: Partial<UserProfile>
	): Promise<void> => {
		if (!user) throw new Error('You must be logged in to update your profile.')

		console.log('🔄 Updating profile with data:', newProfileData)
		try {
			const userRef = doc(db, 'users', user.uid)
			await updateDoc(userRef, newProfileData)
			if (newProfileData.displayName) {
				await updateProfile(auth.currentUser!, {
					displayName: newProfileData.displayName,
				})
			}
			setProfile(prev => (prev ? { ...prev, ...newProfileData } : null))
			console.log('✅ Profile updated successfully.')
		} catch (error) {
			console.error('❌ Error updating profile:', error)
			throw new Error('Failed to update profile. Please try again.')
		}
	}

	const changeUserPassword = async (
		currentPassword: string,
		newPassword: string
	): Promise<boolean> => {
		if (!auth.currentUser) throw new Error('No authenticated user found.')

		console.log('🔒 Attempting to change password...')
		try {
			const credential = EmailAuthProvider.credential(
				auth.currentUser.email!,
				currentPassword
			)
			await reauthenticateWithCredential(auth.currentUser, credential)
			console.log('✅ Re-authentication successful.')

			await updatePassword(auth.currentUser, newPassword)
			console.log('✅ Password updated successfully.')
			return true
		} catch (error: any) {
			console.error('❌ Error changing password:', error)
			switch (error.code) {
				case 'auth/wrong-password':
					throw new Error('The current password is incorrect.')
				case 'auth/weak-password':
					throw new Error('New password must be at least 6 characters long.')
				case 'auth/requires-recent-login':
					throw new Error(
						'Please log out and log back in before changing your password.'
					)
				default:
					throw new Error('Failed to change password. Please try again.')
			}
		}
	}

	const userId = user?.uid ?? null
	const userName = profile?.displayName ?? user?.displayName ?? null

	return {
		user,
		profile,
		loading,
		register,
		login,
		logout,
		updateUserProfile,
		changeUserPassword,

		userId,
		userName,
		isAuthenticated: !!user,
		isEmployer: profile?.role === 'employer',
		isWorker: profile?.role === 'worker',
	}
}
