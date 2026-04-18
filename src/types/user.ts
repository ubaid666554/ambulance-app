export type UserRole = 'patient' | 'driver'

export type VehicleType = 'basic' | 'icu' | 'cardiac'

export interface BaseUser {
  uid: string
  email: string
  name: string
  phone: string
  role: UserRole
  createdAt: number
}

export interface DriverDocuments {
  profilePhotoUri?: string
  cnicPhotoUri?: string
  licensePhotoUri?: string
  vehicleRegPhotoUri?: string
}

export interface DriverProfile extends BaseUser {
  role: 'driver'
  cnic: string
  licenseNumber: string
  vehicleType: VehicleType
  vehicleNumber: string
  isOnline: boolean
  rating: number
  totalTrips: number
  documents: DriverDocuments
  currentLocation?: {
    latitude: number
    longitude: number
    updatedAt: number
  }
}

export interface PatientProfile extends BaseUser {
  role: 'patient'
}

export type UserProfile = DriverProfile | PatientProfile
