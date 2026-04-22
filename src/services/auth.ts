import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import {
  DriverProfile,
  PatientProfile,
  VehicleType,
} from '../types/user'
import {
  normalizePakistanPhone,
  phoneToFakeEmail,
  formatPakistanPhone,
} from '../utils/validators'

export type OtpConfirmation =
  FirebaseAuthTypes.ConfirmationResult

export async function sendOtpToPhone(phone: string): Promise<OtpConfirmation> {
  const normalized = normalizePakistanPhone(phone)
  const confirmation = await auth().signInWithPhoneNumber(normalized)
  return confirmation
}

export async function verifyOtp(
  confirmation: OtpConfirmation,
  code: string,
): Promise<FirebaseAuthTypes.User> {
  const credential = await confirmation.confirm(code)
  if (!credential?.user) {
    throw new Error('OTP verification failed')
  }
  return credential.user
}

export interface DriverSignupData {
  name: string
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

export async function completeDriverSignup(data: DriverSignupData) {
  const currentUser = auth().currentUser
  if (!currentUser) {
    throw new Error('Please verify your phone first')
  }

  const fakeEmail = phoneToFakeEmail(data.phone)
  const emailCredential = auth.EmailAuthProvider.credential(
    fakeEmail,
    data.password,
  )

  try {
    await currentUser.linkWithCredential(emailCredential)
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error(
        'This phone number is already registered. Please sign in instead.',
      )
    }
    throw error
  }

  const uid = currentUser.uid

  const driverProfile: DriverProfile = {
    uid,
    email: fakeEmail,
    name: data.name.trim(),
    phone: formatPakistanPhone(data.phone),
    role: 'driver',
    cnic: data.cnic.trim(),
    licenseNumber: data.licenseNumber.trim(),
    vehicleType: data.vehicleType,
    vehicleNumber: data.vehicleNumber.trim(),
    isOnline: false,
    rating: 5.0,
    totalRatings: 0,
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

export async function signInDriverWithPhone(
  phone: string,
  password: string,
): Promise<FirebaseAuthTypes.User> {
  const fakeEmail = phoneToFakeEmail(phone)
  const credential = await auth().signInWithEmailAndPassword(
    fakeEmail,
    password,
  )
  return credential.user
}

export interface PatientSignupData {
  name: string
  email: string
  phone: string
  password: string
}

export async function signUpPatient(data: PatientSignupData) {
  const credential = await auth().createUserWithEmailAndPassword(
    data.email.trim(),
    data.password,
  )

  const uid = credential.user.uid

  const patientProfile: PatientProfile = {
    uid,
    email: data.email.trim(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: 'patient',
    createdAt: Date.now(),
  }

  await firestore().collection('users').doc(uid).set(patientProfile)

  await auth().signOut()

  return patientProfile
}

export interface PatientProfileUpdate {
  name?: string
  phone?: string
  bloodGroup?: string
  cnic?: string
  profilePhotoUri?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

export async function updatePatientProfile(
  uid: string,
  updates: PatientProfileUpdate,
) {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = typeof value === 'string' ? value.trim() : value
    }
  }
  await firestore().collection('users').doc(uid).update(cleaned)
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
      return 'This account is already registered. Try signing in instead'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect credentials. Please try again'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection'
    case 'auth/invalid-verification-code':
      return 'Invalid OTP code. Please check and try again'
    case 'auth/invalid-verification-id':
      return 'OTP session expired. Please request a new code'
    case 'auth/code-expired':
      return 'OTP code expired. Please request a new one'
    case 'auth/missing-phone-number':
      return 'Please enter a valid phone number'
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format'
    case 'auth/quota-exceeded':
      return 'Daily SMS limit reached. Please try again tomorrow'
    default:
      return 'Something went wrong. Please try again'
  }
}
