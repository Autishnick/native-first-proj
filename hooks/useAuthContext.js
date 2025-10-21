import { createContext, useContext, useMemo } from 'react'
// 1. Імпортуємо наш основний хук з логікою Firebase
import { useAuth } from './useAuth'

// 2. Створюємо React Context
const AuthContext = createContext()

// 3. Створюємо компонент-провайдер
//    Він буде "обгортати" весь наш додаток і надавати доступ до стану аутентифікації
export function AuthProvider({ children }) {
	// Викликаємо наш хук, щоб отримати всю логіку та стан
	const auth = useAuth()

	// useMemo гарантує, що значення контексту не буде створюватися заново при кожному рендері
	const value = useMemo(() => auth, [auth.user, auth.profile, auth.loading])

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 4. Створюємо кастомний хук для зручного доступу до контексту
//    Саме його ви будете використовувати в інших компонентах, як-от AppHeader
export const useAuthContext = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuthContext must be used within an AuthProvider')
	}
	return context
}
