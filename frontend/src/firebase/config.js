// Per your request, all code and comments are in English.
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'

// FIXED: Import from 'firebase/auth' instead of 'firebase/auth/react-native'
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'

const firebaseConfig = {
	apiKey: 'AIzaSyCK_6Lz4lPmp1HpZr5NyGKX8jSd6kkqE4w',
	authDomain: 'reactnativeapp-9ee0f.firebaseapp.com',
	projectId: 'reactnativeapp-9ee0f',
	storageBucket: 'reactnativeapp-9ee0f.firebasestorage.app',
	messagingSenderId: '567338053987',
	appId: '1:567338053987:web:501d5550eed104e2faa356',
	measurementId: 'G-3T7E2BTEHX',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Explicitly initialize Auth for React Native
const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(AsyncStorage),
})

export { app, auth, db }
