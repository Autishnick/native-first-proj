export const formatRole = (role: string | null | undefined): string => {
	if (!role) return 'N/A'
	return role.charAt(0).toUpperCase() + role.slice(1)
}

export const formatDate = (isoString: unknown): string => {
	if (!isoString) return 'N/A'

	try {
		if (
			isoString &&
			typeof (isoString as { toDate?: () => Date }).toDate === 'function'
		) {
			return (isoString as { toDate: () => Date })
				.toDate()
				.toLocaleDateString('en-US')
		}

		let date: Date

		if (typeof isoString === 'string') {
			date = new Date(isoString)
		} else if (typeof isoString === 'number') {
			date = new Date(isoString * 1000)
		} else {
			return 'Invalid Input'
		}

		if (isNaN(date.getTime())) {
			return 'Invalid Date'
		}
		return date.toLocaleDateString('en-US')
	} catch (e) {
		console.error('Error formatting date:', e)
		return 'Invalid Date'
	}
}
