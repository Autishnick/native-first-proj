import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut, // --- NEW IMPORT ---
	updatePassword,
	updateProfile, // --- NEW IMPORT ---
} from 'firebase/auth'
import {
	doc,
	getDoc,
	setDoc,
	updateDoc, // --- NEW IMPORT ---
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config' // Перевірте шлях!

export const useAuth = () => {
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

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

	const register = async (email, password, role, displayName = 'User') => {
		console.log('🚀 Starting registration process...')
		console.log('  Email:', email)
		console.log('  Role:', role)
		console.log('  Display Name:', displayName)

		try {
			// 1. Create user in Firebase Authentication
			console.log('  Step 1: Creating auth user...')
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			)
			const authUser = userCredential.user
			console.log('  ✅ Auth user created:', authUser.uid)

			// 2. Create profile in Firestore
			console.log('  Step 2: Creating Firestore profile...')
			const userDocRef = doc(db, 'users', authUser.uid)
			const profileData = {
				uid: authUser.uid,
				email: authUser.email,
				role: role,
				displayName: displayName,
				createdAt: new Date().toISOString(),
			}
			console.log('  Profile data:', profileData)

			await setDoc(userDocRef, profileData)
			console.log('  ✅ Firestore profile created!')

			// 3. Update local state
			setProfile(profileData)
			console.log('  ✅ Local state updated!')

			return authUser
		} catch (error) {
			console.error('❌ Registration error:', error)
			console.error('  Error code:', error.code)
			console.error('  Error message:', error.message)

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

	// --- NEW FUNCTION: To update user's profile data ---
	const updateUserProfile = async newProfileData => {
		if (!user) throw new Error('You must be logged in to update your profile.')

		console.log('🔄 Updating profile with data:', newProfileData)
		try {
			// 1. Update the Firestore document
			const userRef = doc(db, 'users', user.uid)
			await updateDoc(userRef, newProfileData)
			console.log('✅ Firestore document updated.')

			// 2. If displayName is being changed, update the Auth profile too
			if (newProfileData.displayName) {
				await updateProfile(auth.currentUser, {
					displayName: newProfileData.displayName,
				})
				console.log('✅ Firebase Auth profile updated.')
			}

			// 3. Update local state to reflect changes immediately
			setProfile(prevProfile => ({ ...prevProfile, ...newProfileData }))
			console.log('✅ Local profile state updated.')
		} catch (error) {
			console.error('❌ Error updating profile:', error)
			throw new Error('Failed to update profile. Please try again.')
		}
	}

	// --- NEW FUNCTION: To change the user's password ---
	const changeUserPassword = async newPassword => {
		if (!auth.currentUser) throw new Error('No authenticated user found.')

		console.log('🔒 Attempting to change password...')
		try {
			await updatePassword(auth.currentUser, newPassword)
			console.log('✅ Password updated successfully.')
		} catch (error) {
			console.error('❌ Error changing password:', error)
			// This error often means the user needs to re-authenticate
			if (error.code === 'auth/requires-recent-login') {
				throw new Error(
					'This is a sensitive action. Please log out and log back in before changing your password.'
				)
			}
			throw new Error('Failed to change password.')
		}
	}

	return {
		user,
		profile,
		loading,
		register,
		login,
		logout,
		updateUserProfile, // --- ADDED TO RETURN ---
		changeUserPassword, // --- ADDED TO RETURN ---
		isAuthenticated: !!user,
		isEmployer: profile?.role === 'employer',
		isWorker: profile?.role === 'worker',
	}
}
