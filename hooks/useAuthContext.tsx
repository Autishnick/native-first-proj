import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useAuth } from './useAuth'

interface AuthHookValue {
	user: any
	profile: any
	loading: boolean
	[key: string]: any
}

const AuthContext = createContext<AuthHookValue>({} as AuthHookValue)

interface AuthProviderProps {
	children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
	const { user, profile, loading, ...rest } = useAuth()

	const value: AuthHookValue = useMemo(
		() => ({ user, profile, loading, ...rest }),
		[user, profile, loading]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthHookValue => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}
