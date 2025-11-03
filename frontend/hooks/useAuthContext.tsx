import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth'
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react'
import { api } from '../src/api/client'
import { app } from '../src/firebase/config'

interface User {
	uid: string
	email: string
}

interface Profile {
	displayName: string
	role: 'worker' | 'employer'
}

export interface AuthContextType {
	user: User | null
	profile: Profile | null
	token: string | null
	login: (email: string, password: string) => Promise<void>
	register: (
		email: string,
		password: string,
		role: 'worker' | 'employer',
		displayName: string
	) => Promise<void>
	logout: () => void
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetchProfile = async () => {
	const { data } = await api.get('/profile/me')
	return data
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<User | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [authLoading, setAuthLoading] = useState(false)
	const queryClient = useQueryClient()
	const auth = getAuth(app)

	const {
		data: profile,
		isLoading: profileLoading,
		isFetching: profileFetching,
	} = useQuery<Profile>({
		queryKey: ['profile', user?.uid],
		queryFn: fetchProfile,
		enabled: !!user,
	})

	useEffect(() => {
		if (token) {
			api.defaults.headers.common['Authorization'] = `Bearer ${token}`
		} else {
			delete api.defaults.headers.common['Authorization']
		}
	}, [token])

	const login = async (email: string, password: string) => {
		setAuthLoading(true)
		try {
			const response = await api.post('/auth/login', { email, password })

			if (
				!response.data ||
				!response.data.token ||
				!response.data.user ||
				!response.data.firebaseToken
			) {
				throw new Error('Invalid response from server')
			}

			const { token, user, firebaseToken } = response.data

			await signInWithCustomToken(auth, firebaseToken)

			setToken(token)
			setUser(user)
		} catch (error) {
			console.error('Login failed:', error)
			throw (error as any).response?.data || error
		} finally {
			setAuthLoading(false)
		}
	}

	const register = async (
		email: string,
		password: string,
		role: 'worker' | 'employer',
		displayName: string
	) => {
		setAuthLoading(true)
		try {
			await api.post('/auth/register', {
				email,
				password,
				role,
				displayName,
			})

			await login(email, password)
		} catch (error) {
			console.error('Registration failed:', error)
			throw (error as any).response?.data || error
		} finally {
			setAuthLoading(false)
		}
	}

	const logout = async () => {
		await signOut(auth)
		setUser(null)
		setToken(null)
		queryClient.clear()
		router.replace('/(auth)/login')
	}

	const loading = authLoading || (!!user && (profileLoading || profileFetching))

	const value = useMemo(
		() => ({
			user,
			profile: profile || null,
			token,
			loading,
			login,
			register,
			logout,
		}),
		[user, profile, token, loading]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
