import { Linking, Alert, Platform } from 'react-native'

function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '')
}

export async function callPhone(phone: string): Promise<void> {
  const cleaned = cleanPhone(phone)
  if (!cleaned) {
    Alert.alert('Invalid Number', 'No phone number available')
    return
  }

  const url = Platform.select({
    ios: `telprompt:${cleaned}`,
    android: `tel:${cleaned}`,
  })

  if (!url) return

  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert(
        'Cannot Call',
        'Your device does not support phone calls.',
      )
      return
    }
    await Linking.openURL(url)
  } catch (e: any) {
    Alert.alert('Error', e.message ?? 'Could not open the dialer')
  }
}

export async function sendSMS(phone: string, body?: string): Promise<void> {
  const cleaned = cleanPhone(phone)
  if (!cleaned) {
    Alert.alert('Invalid Number', 'No phone number available')
    return
  }

  const separator = Platform.OS === 'ios' ? '&' : '?'
  const url = body
    ? `sms:${cleaned}${separator}body=${encodeURIComponent(body)}`
    : `sms:${cleaned}`

  try {
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert(
        'Cannot SMS',
        'Your device does not support text messaging.',
      )
      return
    }
    await Linking.openURL(url)
  } catch (e: any) {
    Alert.alert('Error', e.message ?? 'Could not open the SMS app')
  }
}
