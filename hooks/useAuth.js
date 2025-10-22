import {
	createUserWithEmailAndPassword,
	EmailAuthProvider,
	onAuthStateChanged,
	reauthenticateWithCredential,
	signInWithEmailAndPassword,
	signOut,
	updatePassword,
	updateProfile,
} from 'firebase/auth'

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

export const useAuth = () => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	// --- Завантаження профілю користувача з Firestore ---
	const fetchUserProfile = async uid => {
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
				setProfile(docSnap.data())
			} else {
				console.warn('⚠️ User profile not found in Firestore.')
				setProfile(null)
			}
		} catch (error) {
			console.error('❌ Error fetching user profile:', error)
			setProfile(null)
		}
	}

	// --- Слухач змін авторизації ---
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

	// --- Реєстрація ---
	const register = async (email, password, role, displayName = 'User') => {
		try {
			console.log('🚀 Registering:', email)
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			)
			const authUser = userCredential.user

			// Оновлення профілю в Firebase Auth (для displayName)
			await updateProfile(authUser, { displayName })

			const userDocRef = doc(db, 'users', authUser.uid)
			const profileData = {
				uid: authUser.uid,
				email: authUser.email,
				role,
				displayName,
				createdAt: new Date().toISOString(),
			}
			await setDoc(userDocRef, profileData)
			setProfile(profileData)
			return authUser
		} catch (error) {
			console.error('❌ Registration error:', error)
			if (error.code === 'auth/email-already-in-use') {
				throw new Error('This email is already registered.')
			} else if (error.code === 'auth/invalid-email') {
				throw new Error('Invalid email address.')
			} else if (error.code === 'auth/weak-password') {
				throw new Error('Password should be at least 6 characters.')
			} else {
				throw new Error(error.message || 'Registration failed.')
			}
		}
	}

	// --- Вхід ---
	const login = async (email, password) => {
		console.log('🔑 Attempting login:', email)
		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			)
			console.log('✅ Login successful:', userCredential.user.uid)
			return userCredential
		} catch (error) {
			console.error('❌ Login error:', error)
			if (error.code === 'auth/user-not-found') {
				throw new Error('No account found with this email.')
			} else if (error.code === 'auth/wrong-password') {
				throw new Error('Incorrect password.')
			} else if (error.code === 'auth/invalid-email') {
				throw new Error('Invalid email address.')
			} else if (error.code === 'auth/invalid-credential') {
				throw new Error('Invalid email or password.')
			} else {
				throw new Error(error.message || 'Login failed.')
			}
		}
	}

	// --- Вихід ---
	const logout = async () => {
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

	// --- Оновлення профілю ---
	const updateUserProfile = async newProfileData => {
		if (!user) throw new Error('You must be logged in to update your profile.')

		console.log('🔄 Updating profile with data:', newProfileData)
		try {
			const userRef = doc(db, 'users', user.uid)
			await updateDoc(userRef, newProfileData)
			if (newProfileData.displayName) {
				await updateProfile(auth.currentUser, {
					displayName: newProfileData.displayName,
				})
			}
			setProfile(prev => ({ ...prev, ...newProfileData }))
			console.log('✅ Profile updated successfully.')
		} catch (error) {
			console.error('❌ Error updating profile:', error)
			throw new Error('Failed to update profile. Please try again.')
		}
	}

	// --- Зміна пароля з перевіркою поточного ---
	const changeUserPassword = async (currentPassword, newPassword) => {
		if (!auth.currentUser) throw new Error('No authenticated user found.')

		console.log('🔒 Attempting to change password...')
		try {
			// 1️⃣ Re-authenticate user
			const credential = EmailAuthProvider.credential(
				auth.currentUser.email,
				currentPassword
			)
			await reauthenticateWithCredential(auth.currentUser, credential)
			console.log('✅ Re-authentication successful.')

			// 2️⃣ Update password
			await updatePassword(auth.currentUser, newPassword)
			console.log('✅ Password updated successfully.')
			return true
		} catch (error) {
			console.error('❌ Error changing password:', error)
			if (error.code === 'auth/wrong-password') {
				throw new Error('The current password is incorrect.')
			} else if (error.code === 'auth/weak-password') {
				throw new Error('New password must be at least 6 characters long.')
			} else if (error.code === 'auth/requires-recent-login') {
				throw new Error(
					'Please log out and log back in before changing your password.'
				)
			}
			throw new Error('Failed to change password. Please try again.')
		}
	}

	const userId = user?.uid || null
	// Використовуємо displayName з профілю Firestore, якщо є, інакше з Auth
	const userName = profile?.displayName || user?.displayName || null

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
