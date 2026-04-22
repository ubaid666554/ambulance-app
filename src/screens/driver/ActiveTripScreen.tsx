import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigation'
import { Booking, BOOKING_STATUS_LABEL } from '../../types/booking'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants/theme'
import { Button } from '../../components/Button'
import {
  MapPin,
  Navigation,
  CheckCheck,
  Siren,
  PhoneCall,
  User,
  FileText,
} from '../../components/Icons'
import {
  subscribeToBooking,
  markDriverArrived,
  startTrip,
  completeTrip,
} from '../../services/booking'
import { callPhone } from '../../utils/communication'

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveTrip'>

function ActiveTripScreen({ navigation, route }: Props) {
  const { bookingId } = route.params

  const [booking, setBooking] = useState<Booking | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const unsub = subscribeToBooking(bookingId, b => {
      setBooking(b)
      if (!b || b.status === 'completed' || b.status === 'cancelled') {
        setTimeout(() => navigation.replace('DriverHome'), 1500)
      }
    })
    return unsub
  }, [bookingId, navigation])

  const run = async (action: () => Promise<void>, successMsg?: string) => {
    setActionLoading(true)
    try {
      await action()
      if (successMsg) {
        Alert.alert('Done', successMsg)
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  const handleArrived = () => {
    Alert.alert(
      'Confirm Arrival',
      'Mark yourself as arrived at pickup location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, arrived',
          onPress: () => run(() => markDriverArrived(bookingId)),
        },
      ],
    )
  }

  const handleStart = () => {
    Alert.alert('Start Trip', 'Is the patient with you? Start the trip now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start Trip',
        onPress: () => run(() => startTrip(bookingId)),
      },
    ])
  }

  const handleComplete = () => {
    Alert.alert(
      'Complete Trip',
      'Have you dropped the patient at the destination?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => run(() => completeTrip(bookingId)),
        },
      ],
    )
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const renderPrimaryAction = () => {
    if (booking.status === 'accepted') {
      return (
        <Button
          title="I've arrived at pickup"
          onPress={handleArrived}
          loading={actionLoading}
          style={styles.primaryAction}
        />
      )
    }
    if (booking.status === 'arrived') {
      return (
        <Button
          title="Start Trip"
          onPress={handleStart}
          loading={actionLoading}
          variant="secondary"
          style={styles.primaryAction}
        />
      )
    }
    if (booking.status === 'in_progress') {
      return (
        <Button
          title="Complete Trip"
          onPress={handleComplete}
          loading={actionLoading}
          style={[styles.primaryAction, styles.completeBtn]}
        />
      )
    }
    return null
  }

  const stepColor = (active: boolean) =>
    active ? Colors.success : Colors.border

  const isArrived =
    booking.status === 'arrived' ||
    booking.status === 'in_progress' ||
    booking.status === 'completed'
  const isInProgress =
    booking.status === 'in_progress' || booking.status === 'completed'
  const isDone = booking.status === 'completed'

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusLabel}>CURRENT STATUS</Text>
          <Text style={styles.statusValue}>
            {BOOKING_STATUS_LABEL[booking.status]}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: Colors.success },
              ]}
            />
            <Text style={styles.stepLabel}>Accepted</Text>
          </View>
          <View
            style={[
              styles.stepLine,
              { backgroundColor: stepColor(isArrived) },
            ]}
          />
          <View style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: stepColor(isArrived) },
              ]}
            />
            <Text style={styles.stepLabel}>Arrived</Text>
          </View>
          <View
            style={[
              styles.stepLine,
              { backgroundColor: stepColor(isInProgress) },
            ]}
          />
          <View style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: stepColor(isInProgress) },
              ]}
            />
            <Text style={styles.stepLabel}>In progress</Text>
          </View>
          <View
            style={[
              styles.stepLine,
              { backgroundColor: stepColor(isDone) },
            ]}
          />
          <View style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                { backgroundColor: stepColor(isDone) },
              ]}
            />
            <Text style={styles.stepLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <View style={styles.avatarPlaceholder}>
              <User size={28} color={Colors.patient} strokeWidth={2.5} />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientLabel}>YOUR PATIENT</Text>
              <Text style={styles.patientName}>{booking.patientName}</Text>
              <Text style={styles.patientPhone}>{booking.patientPhone}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => callPhone(booking.patientPhone)}
            style={({ pressed }) => [
              styles.callButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Call patient">
            <PhoneCall size={18} color={Colors.textLight} strokeWidth={2.5} />
            <Text style={styles.callButtonText}>Call Patient</Text>
          </Pressable>
        </View>

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
              <Text style={styles.tripFieldLabel}>PICKUP</Text>
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
              <Text style={styles.tripFieldLabel}>DESTINATION</Text>
              <Text style={styles.tripValue}>
                {booking.destinationAddress}
              </Text>
            </View>
          </View>

          {booking.notes ? (
            <>
              <View style={styles.tripDivider} />
              <View style={styles.tripRow}>
                <View
                  style={[
                    styles.tripIcon,
                    { backgroundColor: Colors.secondaryLight },
                  ]}>
                  <FileText
                    size={16}
                    color={Colors.secondary}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.tripText}>
                  <Text style={styles.tripFieldLabel}>EMERGENCY NOTES</Text>
                  <Text style={styles.tripValue}>{booking.notes}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {booking.status === 'completed' ? (
          <View style={styles.completedBanner}>
            <View style={styles.completedIcon}>
              <CheckCheck
                size={32}
                color={Colors.success}
                strokeWidth={2.5}
              />
            </View>
            <Text style={styles.completedTitle}>Trip completed!</Text>
            <Text style={styles.completedSubtitle}>
              Great job. Returning to home screen...
            </Text>
          </View>
        ) : (
          renderPrimaryAction()
        )}
      </ScrollView>
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
  statusBanner: {
    backgroundColor: Colors.driver,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadow.sm,
  },
  statusLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textLight,
    letterSpacing: -0.3,
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  stepRow: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  patientCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.patientLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  patientName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadow.sm,
  },
  callButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  tripCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
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
  tripFieldLabel: {
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
  primaryAction: {
    marginTop: Spacing.sm,
    ...Shadow.md,
  },
  completeBtn: {
    backgroundColor: Colors.success,
  },
  completedBanner: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  completedTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
})

export default ActiveTripScreen
