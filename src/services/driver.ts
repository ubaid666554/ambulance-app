import firestore from '@react-native-firebase/firestore'
import { DriverProfile } from '../types/user'

export async function setDriverOnlineStatus(uid: string, isOnline: boolean) {
  await firestore().collection('users').doc(uid).update({
    isOnline,
    onlineUpdatedAt: Date.now(),
  })
}

export async function updateDriverLocation(
  uid: string,
  latitude: number,
  longitude: number,
) {
  await firestore()
    .collection('users')
    .doc(uid)
    .update({
      currentLocation: {
        latitude,
        longitude,
        updatedAt: Date.now(),
      },
    })
}

export async function getDriverProfile(uid: string): Promise<DriverProfile | null> {
  const doc = await firestore().collection('users').doc(uid).get()
  if (!doc.exists) return null
  return doc.data() as DriverProfile
}
