import React from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AppNavigator from './src/navigation/AppNavigator'
import { Colors } from './src/constants/colors'

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default App
