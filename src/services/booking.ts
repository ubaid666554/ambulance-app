import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'
import { Booking, BookingStatus, isActiveBooking } from '../types/booking'
import { DriverProfile, VehicleType } from '../types/user'

const COLLECTION = 'bookings'

function bookingsCollection() {
  return firestore().collection(COLLECTION)
}

export interface CreateBookingArgs {
  patientId: string
  patientName: string
  patientPhone: string
  pickupAddress: string
  destinationAddress: string
  requestedVehicleType: VehicleType
  notes?: string
}

export async function createBooking(args: CreateBookingArgs): Promise<string> {
  const docRef = bookingsCollection().doc()
  const booking: Booking = {
    id: docRef.id,
    patientId: args.patientId,
    patientName: args.patientName.trim(),
    patientPhone: args.patientPhone.trim(),
    pickupAddress: args.pickupAddress.trim(),
    destinationAddress: args.destinationAddress.trim(),
    requestedVehicleType: args.requestedVehicleType,
    notes: args.notes?.trim() || undefined,
    status: 'pending',
    createdAt: Date.now(),
  }

  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(booking)) {
    if (value !== undefined) cleaned[key] = value
  }

  await docRef.set(cleaned)
  return docRef.id
}

export async function acceptBooking(
  bookingId: string,
  driver: DriverProfile,
): Promise<void> {
  const docRef = bookingsCollection().doc(bookingId)

  await firestore().runTransaction(async tx => {
    const snap = await tx.get(docRef)
    if (!snap.exists) throw new Error('Booking no longer exists')

    const booking = snap.data() as Booking
    if (booking.status !== 'pending') {
      throw new Error('Another driver has already accepted this booking')
    }

    tx.update(docRef, {
      status: 'accepted' as BookingStatus,
      acceptedAt: Date.now(),
      driverId: driver.uid,
      driverName: driver.name,
      driverPhone: driver.phone,
      driverVehicleNumber: driver.vehicleNumber,
      driverVehicleType: driver.vehicleType,
    })
  })
}

export async function markDriverArrived(bookingId: string): Promise<void> {
  await bookingsCollection().doc(bookingId).update({
    status: 'arrived' as BookingStatus,
    arrivedAt: Date.now(),
  })
}

export async function startTrip(bookingId: string): Promise<void> {
  await bookingsCollection().doc(bookingId).update({
    status: 'in_progress' as BookingStatus,
    startedAt: Date.now(),
  })
}

export async function completeTrip(bookingId: string): Promise<void> {
  await bookingsCollection().doc(bookingId).update({
    status: 'completed' as BookingStatus,
    completedAt: Date.now(),
  })

  const bookingSnap = await bookingsCollection().doc(bookingId).get()
  const booking = bookingSnap.data() as Booking | undefined
  if (booking?.driverId) {
    await firestore()
      .collection('users')
      .doc(booking.driverId)
      .update({
        totalTrips: firestore.FieldValue.increment(1),
      })
  }
}

export async function cancelBooking(
  bookingId: string,
  reason?: string,
): Promise<void> {
  await bookingsCollection().doc(bookingId).update({
    status: 'cancelled' as BookingStatus,
    cancelledAt: Date.now(),
    cancelReason: reason ?? 'Cancelled by user',
  })
}

export async function markBookingRated(bookingId: string): Promise<void> {
  await bookingsCollection().doc(bookingId).update({ rated: true })
}

type Unsubscribe = () => void

export function subscribeToPatientActiveBooking(
  patientId: string,
  callback: (booking: Booking | null) => void,
): Unsubscribe {
  return bookingsCollection()
    .where('patientId', '==', patientId)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .onSnapshot(
      snap => {
        const active = snap.docs
          .map(d => d.data() as Booking)
          .find(b => isActiveBooking(b.status))
        callback(active ?? null)
      },
      err => {
        console.error('patient booking listener error:', err)
        callback(null)
      },
    )
}

export function subscribeToPendingRequests(
  vehicleType: VehicleType,
  callback: (bookings: Booking[]) => void,
): Unsubscribe {
  return bookingsCollection()
    .where('status', '==', 'pending')
    .where('requestedVehicleType', '==', vehicleType)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .onSnapshot(
      snap => {
        const list = snap.docs.map(d => d.data() as Booking)
        callback(list)
      },
      err => {
        console.error('pending requests listener error:', err)
        callback([])
      },
    )
}

export function subscribeToDriverActiveBooking(
  driverId: string,
  callback: (booking: Booking | null) => void,
): Unsubscribe {
  return bookingsCollection()
    .where('driverId', '==', driverId)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .onSnapshot(
      snap => {
        const active = snap.docs
          .map(d => d.data() as Booking)
          .find(b => isActiveBooking(b.status))
        callback(active ?? null)
      },
      err => {
        console.error('driver booking listener error:', err)
        callback(null)
      },
    )
}

export function subscribeToBooking(
  bookingId: string,
  callback: (booking: Booking | null) => void,
): Unsubscribe {
  return bookingsCollection()
    .doc(bookingId)
    .onSnapshot(
      (snap: FirebaseFirestoreTypes.DocumentSnapshot) => {
        if (!snap.exists) {
          callback(null)
          return
        }
        callback(snap.data() as Booking)
      },
      err => {
        console.error('booking listener error:', err)
        callback(null)
      },
    )
}
