import { UserRole } from './user'

export type RootStackParamList = {
  Splash: undefined
  RoleSelection: undefined
  Login: { role: UserRole }
  DriverSignup: undefined
  PatientSignup: undefined
  PatientHome: undefined
  DriverHome: undefined
  EditProfile: undefined
  RequestAmbulance: undefined
  BookingStatus: { bookingId: string }
  ActiveTrip: { bookingId: string }
}
