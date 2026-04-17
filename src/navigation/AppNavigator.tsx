import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import SplashScreen from '../screens/SplashScreen'
import RoleSelectionScreen from '../screens/RoleSelectionScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
