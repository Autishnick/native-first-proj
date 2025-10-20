import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { auth, db } from '../src/firebase/config' // Ensure correct import path

export const useAuth = () => {
	// Firebase Auth user object
	const [user, setUser] = useState(null)
	// User profile from Firestore (role, email, displayName)
	const [profile, setProfile] = useState(null)
	const [loading, setLoading] = useState(true)

	// Helper function to fetch user profile (role) from Firestore
	const fetchUserProfile = async uid => {
		if (!uid) {
			setProfile(null)
			return
		}
		try {
			const userRef = doc(db, 'users', uid)
			const docSnap = await getDoc(userRef)
			if (docSnap.exists()) {
				setProfile(docSnap.data())
			} else {
				console.warn('User profile not found in Firestore.')
				setProfile(null)
			}
		} catch (error) {
			console.error('Error fetching user profile:', error)
			setProfile(null)
		}
	}

	// Auth state change listener: runs on app load, login, and logout
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async authUser => {
			setUser(authUser)
			if (authUser) {
				// If logged in, fetch the role immediately
				await fetchUserProfile(authUser.uid)
			} else {
				setProfile(null) // Clear profile on logout
			}
			setLoading(false)
		})
		return () => unsubscribe() // Cleanup
	}, [])

	// --- REGISTRATION LOGIC ---
	const register = async (email, password, role, displayName = 'User') => {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		)
		const authUser = userCredential.user

		// Create profile in Firestore with role and UID as Document ID
		const userDocRef = doc(db, 'users', authUser.uid)
		await setDoc(userDocRef, {
			email: authUser.email,
			role: role, // 'worker' or 'employer'
			displayName: displayName,
			createdAt: new Date(),
		})

		// Update local state
		setProfile({ email: authUser.email, role: role, displayName: displayName })
	}

	// --- LOGIN LOGIC ---
	const login = async (email, password) => {
		// Firebase Auth handles login; useEffect will fetch the profile automatically
		return signInWithEmailAndPassword(auth, email, password)
	}

	// --- LOGOUT LOGIC ---
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
		// Simplified role checks
		isAuthenticated: !!user,
		isEmployer: profile?.role === 'employer',
		isWorker: profile?.role === 'worker',
	}
}
