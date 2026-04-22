import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { RootStackParamList } from '../types/navigation'
import { useAuth } from '../context/AuthContext'
import { Colors } from '../constants/colors'
import SplashScreen from '../screens/SplashScreen'
import RoleSelectionScreen from '../screens/RoleSelectionScreen'
import LoginScreen from '../screens/auth/LoginScreen'
import DriverSignupScreen from '../screens/auth/DriverSignupScreen'
import PatientSignupScreen from '../screens/auth/PatientSignupScreen'
import DriverHomeScreen from '../screens/driver/DriverHomeScreen'
import ActiveTripScreen from '../screens/driver/ActiveTripScreen'
import PatientHomeScreen from '../screens/patient/PatientHomeScreen'
import EditProfileScreen from '../screens/patient/EditProfileScreen'
import RequestAmbulanceScreen from '../screens/patient/RequestAmbulanceScreen'
import BookingStatusScreen from '../screens/patient/BookingStatusScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

function AppNavigator() {
  const { user, profile, initializing } = useAuth()

  if (initializing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const isSignedInDriver = user && profile && profile.role === 'driver'
  const isSignedInPatient = user && profile && profile.role === 'patient'

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedInDriver ? (
          <>
            <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
            <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
          </>
        ) : isSignedInPatient ? (
          <>
            <Stack.Screen name="PatientHome" component={PatientHomeScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen
              name="RequestAmbulance"
              component={RequestAmbulanceScreen}
            />
            <Stack.Screen
              name="BookingStatus"
              component={BookingStatusScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
              name="RoleSelection"
              component={RoleSelectionScreen}
            />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="DriverSignup"
              component={DriverSignupScreen}
            />
            <Stack.Screen
              name="PatientSignup"
              component={PatientSignupScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
})

export default AppNavigator
