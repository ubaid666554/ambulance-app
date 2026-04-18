import { UserRole } from './user'

export type RootStackParamList = {
  Splash: undefined
  RoleSelection: undefined
  Login: { role: UserRole }
  DriverSignup: undefined
  PatientHome: undefined
  DriverHome: undefined
}
