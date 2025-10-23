import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './useAuth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const auth = useAuth()

	const value = useMemo(() => auth, [auth.user, auth.profile, auth.loading])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}
