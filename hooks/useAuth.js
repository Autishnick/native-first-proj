import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config'

export const useAuth = () => {
	// 'user' is the Firebase Auth user object.
	// 'profile' stores the role and other data from Firestore.
	const [user, setUser] = useState(null)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	// Helper function to fetch user role from Firestore
	const fetchUserProfile = async uid => {
		if (!uid) {
			setProfile(null)
			return
		}
		try {
			const userRef = doc(db, 'users', uid)
			const docSnap = await getDoc(userRef)
			if (docSnap.exists()) {
				setProfile(docSnap.data()) // Sets { role: 'worker', email: '...', etc. }
			} else {
				console.warn('User profile not found in Firestore.')
				setProfile(null)
			}
		} catch (error) {
			console.error('Error fetching user profile:', error)
			setProfile(null)
		}
	}

	// Auth state change listener
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async authUser => {
			setUser(authUser)
			if (authUser) {
				await fetchUserProfile(authUser.uid)
			} else {
				setProfile(null) // Clear profile on logout
			}
			setLoading(false)
		})
		return () => unsubscribe()
	}, [])

	const register = async (email, password, role) => {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		)
		const authUser = userCredential.user

		// CRITICAL: Set profile data with UID as Document ID
		const userDocRef = doc(db, 'users', authUser.uid)
		await setDoc(userDocRef, {
			email: authUser.email,
			role: role, // 'worker' or 'employer'
			displayName: '', // Default display name
			createdAt: new Date(),
		})

		// Update the local profile state immediately
		setProfile({ email: authUser.email, role: role, displayName: '' })
	}

	const login = async (email, password) => {
		// Auth service handles login; useEffect will automatically fetch the profile
		return signInWithEmailAndPassword(auth, email, password)
	}

	const logout = () => {
		return signOut(auth)
	}

	return {
		user,
		profile,
		loading,
		register,
		login,
		logout,
		isEmployer: profile?.role === 'employer',
	}
}
