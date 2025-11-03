// Per your request, all code and comments are in English.
import axios from 'axios'
import { auth } from '../firebase/config' // 1. Import your auth config

// Set your NestJS backend URL
// For Android emulator, use 10.0.2.2. For iOS/physical, use your IP.
const BASE_URL = 'http://localhost:3000/' // <-- Make sure this IP is correct

// Create the axios instance
const api = axios.create({
	baseURL: BASE_URL,
})

// --- THIS IS THE CORRECT INTERCEPTOR ---
// It runs BEFORE every request
api.interceptors.request.use(
	async config => {
		// 1. Get the current user from Firebase Auth
		const user = auth.currentUser

		if (user) {
			// 2. Get the user's ID Token (Firebase handles refreshing it)
			const token = await user.getIdToken()

			// 3. Set the Authorization header
			config.headers.Authorization = `Bearer ${token}`
		}

		// 4. Send the request
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

export { api }
