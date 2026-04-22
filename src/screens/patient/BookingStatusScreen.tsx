import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import firestore from '@react-native-firebase/firestore'
import { RootStackParamList } from '../../types/navigation'
import { Booking, BOOKING_STATUS_LABEL } from '../../types/booking'
import { DriverProfile } from '../../types/user'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants/theme'
import { Button } from '../../components/Button'
import { DriverDetailsCard } from '../../components/DriverDetailsCard'
import { RatingModal } from '../../components/RatingModal'
import { MapPin, Navigation, CheckCheck, Siren } from '../../components/Icons'
import {
  subscribeToBooking,
  cancelBooking,
  markBookingRated,
} from '../../services/booking'

type Props = NativeStackScreenProps<RootStackParamList, 'BookingStatus'>

function BookingStatusScreen({ navigation, route }: Props) {
  const { bookingId } = route.params

  const [booking, setBooking] = useState<Booking | null>(null)
  const [driver, setDriver] = useState<DriverProfile | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [ratingModalVisible, setRatingModalVisible] = useState(false)

  const pulseAnim = useRef(new Animated.Value(0)).current
  const spinAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [pulseAnim, spinAnim])

  useEffect(() => {
    const unsub = subscribeToBooking(bookingId, setBooking)
    return unsub
  }, [bookingId])

  useEffect(() => {
    if (!booking?.driverId) {
      setDriver(null)
      return
    }

    const unsub = firestore()
      .collection('users')
      .doc(booking.driverId)
      .onSnapshot(doc => {
        if (doc.exists) setDriver(doc.data() as DriverProfile)
      })
    return unsub
  }, [booking?.driverId])

  useEffect(() => {
    if (booking?.status === 'completed' && !booking.rated) {
      const t = setTimeout(() => setRatingModalVisible(true), 600)
      return () => clearTimeout(t)
    }
  }, [booking?.status, booking?.rated])

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking?',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No, keep it', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true)
            try {
              await cancelBooking(bookingId, 'Cancelled by patient')
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not cancel')
            } finally {
              setCancelling(false)
            }
          },
        },
      ],
    )
  }

  const handleClose = () => {
    navigation.replace('PatientHome')
  }

  const handleRated = async () => {
    try {
      await markBookingRated(bookingId)
    } catch (e) {
      // silent — UI will handle
    }
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  })
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  })

  const renderPending = () => (
    <View style={styles.statusSection}>
      <View style={styles.loaderWrap}>
        <Animated.View
          style={[styles.pulseRing, {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }]}
        />
        <Animated.View
          style={[styles.loaderIcon, { transform: [{ rotate: spin }] }]}>
          <Siren size={40} color={Colors.primary} strokeWidth={2.5} />
        </Animated.View>
      </View>

      <Text style={styles.statusTitle}>Searching for driver...</Text>
      <Text style={styles.statusSubtitle}>
        We're notifying nearby ambulance drivers with the matching type. This
        usually takes 1-2 minutes.
      </Text>
    </View>
  )

  const renderAcceptedOrActive = () => {
    if (!driver) return null

    const etaMinutes =
      booking.status === 'accepted'
        ? 8
        : booking.status === 'arrived'
        ? 0
        : undefined

    const progressLabels: Record<string, { color: string; text: string }> = {
      accepted: { color: Colors.warning, text: 'Driver is on the way' },
      arrived: {
        color: Colors.success,
        text: 'Driver has arrived at your location',
      },
      in_progress: {
        color: Colors.secondary,
        text: 'On the way to hospital',
      },
    }
    const label =
      progressLabels[booking.status] ?? progressLabels.accepted

    return (
      <>
        <View
          style={[
            styles.progressBanner,
            { backgroundColor: label.color },
          ]}>
          <Text style={styles.progressText}>{label.text}</Text>
        </View>

        <DriverDetailsCard driver={driver} etaMinutes={etaMinutes} />
      </>
    )
  }

  const renderCompleted = () => (
    <View style={styles.statusSection}>
      <View style={styles.completedIcon}>
        <CheckCheck size={48} color={Colors.success} strokeWidth={2.5} />
      </View>
      <Text style={styles.statusTitle}>Trip completed!</Text>
      <Text style={styles.statusSubtitle}>
        You've arrived at your destination. Thanks for using MediRush.
      </Text>
      {driver && !booking.rated ? (
        <Button
          title="Rate your driver"
          onPress={() => setRatingModalVisible(true)}
          style={styles.primaryAction}
        />
      ) : null}
    </View>
  )

  const renderCancelled = () => (
    <View style={styles.statusSection}>
      <View style={[styles.completedIcon, { backgroundColor: Colors.primaryLight }]}>
        <Siren size={40} color={Colors.primary} strokeWidth={2.5} />
      </View>
      <Text style={styles.statusTitle}>Booking cancelled</Text>
      <Text style={styles.statusSubtitle}>
        {booking.cancelReason ?? 'This booking has been cancelled.'}
      </Text>
    </View>
  )

  const showCancelButton =
    booking.status === 'pending' || booking.status === 'accepted'

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.headerLabel}>
          {BOOKING_STATUS_LABEL[booking.status]}
        </Text>

        {booking.status === 'pending'
          ? renderPending()
          : booking.status === 'completed'
          ? renderCompleted()
          : booking.status === 'cancelled'
          ? renderCancelled()
          : renderAcceptedOrActive()}

        <View style={styles.tripCard}>
          <Text style={styles.tripCardTitle}>Trip details</Text>

          <View style={styles.tripRow}>
            <View
              style={[
                styles.tripIcon,
                { backgroundColor: Colors.primaryLight },
              ]}>
              <MapPin size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.tripText}>
              <Text style={styles.tripLabel}>PICKUP</Text>
              <Text style={styles.tripValue}>{booking.pickupAddress}</Text>
            </View>
          </View>

          <View style={styles.tripDivider} />

          <View style={styles.tripRow}>
            <View
              style={[
                styles.tripIcon,
                { backgroundColor: Colors.successLight },
              ]}>
              <Navigation
                size={16}
                color={Colors.success}
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.tripText}>
              <Text style={styles.tripLabel}>DESTINATION</Text>
              <Text style={styles.tripValue}>
                {booking.destinationAddress}
              </Text>
            </View>
          </View>

          {booking.notes ? (
            <>
              <View style={styles.tripDivider} />
              <View style={styles.tripRow}>
                <View style={styles.tripText}>
                  <Text style={styles.tripLabel}>NOTES</Text>
                  <Text style={styles.tripValue}>{booking.notes}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {showCancelButton ? (
          <Button
            title="Cancel Booking"
            onPress={handleCancel}
            loading={cancelling}
            variant="outline"
            style={styles.cancelButton}
          />
        ) : null}

        {booking.status === 'completed' || booking.status === 'cancelled' ? (
          <Button
            title="Back to Home"
            onPress={handleClose}
            variant="ghost"
            style={styles.closeButton}
          />
        ) : null}
      </ScrollView>

      {driver ? (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => setRatingModalVisible(false)}
          onSubmitted={handleRated}
          driverId={driver.uid}
          driverName={driver.name}
          vehicleNumber={driver.vehicleNumber}
          bookingId={booking.id}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  headerLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loaderWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
  },
  loaderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
  },
  progressBanner: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  progressText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
    letterSpacing: 0.3,
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tripCardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  tripRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  tripIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripText: {
    flex: 1,
  },
  tripLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tripValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  tripDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  cancelButton: {
    marginTop: Spacing.sm,
  },
  closeButton: {
    marginTop: Spacing.sm,
  },
  primaryAction: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    alignSelf: 'stretch',
  },
})

export default BookingStatusScreen
