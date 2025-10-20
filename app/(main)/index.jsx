import React from 'react'
import { StyleSheet, View } from 'react-native'

export default function ActiveTodosScreen() {
	return <View style={styles.container}></View>
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: 'white',
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		margin: 10,
		color: '#333',
	},
})
