import firestore from '@react-native-firebase/firestore'
import { Rating, StarValue } from '../types/rating'
import { DriverProfile } from '../types/user'

export interface SubmitRatingArgs {
  driverId: string
  driverName: string
  patientId: string
  patientName: string
  stars: StarValue
  comment?: string
  bookingId?: string
}

export async function submitRating(args: SubmitRatingArgs): Promise<void> {
  const ratingsCollection = firestore().collection('ratings')
  const driverDoc = firestore().collection('users').doc(args.driverId)
  const newRatingRef = ratingsCollection.doc()

  await firestore().runTransaction(async tx => {
    const driverSnap = await tx.get(driverDoc)
    if (!driverSnap.exists) {
      throw new Error('Driver not found')
    }

    const driver = driverSnap.data() as DriverProfile
    const prevTotal = driver.totalRatings ?? 0
    const prevAvg = driver.rating ?? 0

    const newTotal = prevTotal + 1
    const newAvg = (prevAvg * prevTotal + args.stars) / newTotal

    const rating: Rating = {
      id: newRatingRef.id,
      driverId: args.driverId,
      driverName: args.driverName,
      patientId: args.patientId,
      patientName: args.patientName,
      bookingId: args.bookingId,
      stars: args.stars,
      comment: args.comment?.trim() || undefined,
      createdAt: Date.now(),
    }

    const cleanedRating: Record<string, any> = {}
    for (const [key, value] of Object.entries(rating)) {
      if (value !== undefined) cleanedRating[key] = value
    }

    tx.set(newRatingRef, cleanedRating)
    tx.update(driverDoc, {
      rating: Math.round(newAvg * 10) / 10,
      totalRatings: newTotal,
    })
  })
}

export async function getDriverRatings(
  driverId: string,
  limit: number = 20,
): Promise<Rating[]> {
  const snapshot = await firestore()
    .collection('ratings')
    .where('driverId', '==', driverId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map(doc => doc.data() as Rating)
}

export async function getAvailableDrivers(): Promise<DriverProfile[]> {
  const snapshot = await firestore()
    .collection('users')
    .where('role', '==', 'driver')
    .limit(10)
    .get()

  return snapshot.docs.map(doc => doc.data() as DriverProfile)
}
