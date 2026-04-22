import { VehicleType } from './user'

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export interface Booking {
  id: string

  patientId: string
  patientName: string
  patientPhone: string

  driverId?: string
  driverName?: string
  driverPhone?: string
  driverVehicleNumber?: string
  driverVehicleType?: VehicleType

  pickupAddress: string
  destinationAddress: string
  requestedVehicleType: VehicleType
  notes?: string

  status: BookingStatus
  rated?: boolean

  createdAt: number
  acceptedAt?: number
  arrivedAt?: number
  startedAt?: number
  completedAt?: number
  cancelledAt?: number
  cancelReason?: string
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Searching for driver',
  accepted: 'Driver on the way',
  arrived: 'Driver arrived',
  in_progress: 'Trip in progress',
  completed: 'Trip completed',
  cancelled: 'Cancelled',
}

export function isActiveBooking(status: BookingStatus): boolean {
  return (
    status === 'pending' ||
    status === 'accepted' ||
    status === 'arrived' ||
    status === 'in_progress'
  )
}
