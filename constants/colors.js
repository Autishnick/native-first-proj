// File: constants/colors.js
export const COLORS = {
	background: '#0B1A2A', // Main dark background
	card: '#122B46', // Background for cards, sections
	cardDarker: '#2D3748', // Used in BrowseScreen card, Chat messages
	bidSection: '#0B1A2A', // Darker area for bid/admin controls (same as background)

	textPrimary: '#FFFFFF', // Main text color (white)
	textSecondary: '#A0B3C9', // Lighter gray text (subtitles, labels)
	textPlaceholder: '#888', // Placeholder text color

	accentGreen: '#2ECC71', // Main accent (buttons, highlights, values)
	accentRed: '#FF6B6B', // Destructive actions (delete, decline)
	accentBlue: '#4A90E2', // Edit button, Assign action

	buttonTextDark: '#1A202C', // Dark text for light buttons (e.g., green button)
	buttonTextLight: '#FFFFFF', // Light text for dark buttons

	border: '#1C3B5A', // Borders between rows, input borders
	borderLighter: '#4A5568', // Lighter border used elsewhere

	// Specific UI elements from other files (added for consistency)
	unreadBackground: '#374151', // From NotificationsScreen
	readBackground: '#2D3748', // From NotificationsScreen (same as cardDarker)
}
