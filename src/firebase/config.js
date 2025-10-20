// Import the functions you need from the SDKs you need
import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
const firebaseConfig = {
	apiKey: 'AIzaSyCK_6Lz4lPmp1HpZr5NyGKX8jSd6kkqE4w',
	authDomain: 'reactnativeapp-9ee0f.firebaseapp.com',
	projectId: 'reactnativeapp-9ee0f',
	storageBucket: 'reactnativeapp-9ee0f.firebasestorage.app',
	messagingSenderId: '567338053987',
	appId: '1:567338053987:web:501d5550eed104e2faa356',
	measurementId: 'G-3T7E2BTEHX',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
