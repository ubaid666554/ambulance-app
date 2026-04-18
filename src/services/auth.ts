import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { DriverProfile, VehicleType } from '../types/user'

export interface DriverSignupData {
  name: string
  email: string
  phone: string
  password: string
  cnic: string
  licenseNumber: string
  vehicleType: VehicleType
  vehicleNumber: string
  profilePhotoUri?: string
  cnicPhotoUri?: string
  licensePhotoUri?: string
  vehicleRegPhotoUri?: string
}

export async function signUpDriver(data: DriverSignupData) {
  const credential = await auth().createUserWithEmailAndPassword(
    data.email.trim(),
    data.password,
  )

  const uid = credential.user.uid

  const driverProfile: DriverProfile = {
    uid,
    email: data.email.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: 'driver',
    cnic: data.cnic.trim(),
    licenseNumber: data.licenseNumber.trim(),
    vehicleType: data.vehicleType,
    vehicleNumber: data.vehicleNumber.trim(),
    isOnline: false,
    rating: 5.0,
    totalTrips: 0,
    documents: {
      profilePhotoUri: data.profilePhotoUri,
      cnicPhotoUri: data.cnicPhotoUri,
      licensePhotoUri: data.licensePhotoUri,
      vehicleRegPhotoUri: data.vehicleRegPhotoUri,
    },
    createdAt: Date.now(),
  }

  await firestore().collection('users').doc(uid).set(driverProfile)

  await auth().signOut()

  return driverProfile
}

export async function signIn(email: string, password: string) {
  const credential = await auth().signInWithEmailAndPassword(
    email.trim(),
    password,
  )
  return credential.user
}

export async function signOut() {
  await auth().signOut()
}

export function getFriendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address'
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection'
    default:
      return 'Something went wrong. Please try again'
  }
}
