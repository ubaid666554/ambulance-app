import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants/theme'
import {
  Siren,
  Car,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  LogOut,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import { DriverProfile } from '../../types/user'
import { setDriverOnlineStatus } from '../../services/driver'

function DriverHomeScreen() {
  const { profile, user, signOut } = useAuth()
  const driver = profile as DriverProfile | null

  const [isOnline, setIsOnline] = useState(driver?.isOnline ?? false)
  const [toggling, setToggling] = useState(false)

  const handleToggleOnline = async (value: boolean) => {
    if (!user) return
    setToggling(true)
    try {
      await setDriverOnlineStatus(user.uid, value)
      setIsOnline(value)
    } catch (error) {
      Alert.alert('Error', 'Could not update status. Please try again.')
    } finally {
      setToggling(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ])
  }

  if (!driver) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const vehicleTypeLabel =
    driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1)

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{driver.name}</Text>
          </View>

          <Pressable
            onPress={handleSignOut}
            style={styles.logoutButton}
            hitSlop={8}
            accessibilityLabel="Sign out">
            <LogOut size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View
          style={[
            styles.statusCard,
            isOnline ? styles.statusCardOnline : styles.statusCardOffline,
          ]}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                isOnline ? styles.statusLabelOnline : styles.statusLabelOffline,
              ]}>
              {isOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}
            </Text>
          </View>

          <Text style={styles.statusMessage}>
            {isOnline
              ? 'Ready to accept emergency requests'
              : 'Go online to start receiving requests'}
          </Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={toggling}
              trackColor={{
                false: Colors.border,
                true: Colors.success,
              }}
              thumbColor={Colors.surface}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
              <CheckCircle size={20} color={Colors.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{driver.totalTrips}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primaryLight }]}>
              <Star size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>{driver.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.secondaryLight }]}>
              <Clock size={20} color={Colors.secondary} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Vehicle</Text>

          <View style={styles.vehicleCard}>
            <View style={styles.vehicleIconWrapper}>
              <Car size={28} color={Colors.driver} strokeWidth={2.5} />
            </View>

            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleBadge}>
                <Siren size={12} color={Colors.driver} strokeWidth={3} />
                <Text style={styles.vehicleBadgeText}>
                  {vehicleTypeLabel} Ambulance
                </Text>
              </View>
              <Text style={styles.vehicleNumber}>{driver.vehicleNumber}</Text>
              <Text style={styles.vehicleDetail}>
                License: {driver.licenseNumber}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incoming Requests</Text>

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MapPin size={32} color={Colors.textTertiary} strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyText}>
              {isOnline
                ? 'Patient requests will appear here in real-time'
                : 'Go online to start receiving emergency requests'}
            </Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
  },
  statusCardOnline: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  statusCardOffline: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOnline: {
    backgroundColor: Colors.success,
  },
  statusDotOffline: {
    backgroundColor: Colors.textTertiary,
  },
  statusLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    letterSpacing: 1.2,
  },
  statusLabelOnline: {
    color: Colors.success,
  },
  statusLabelOffline: {
    color: Colors.textSecondary,
  },
  statusMessage: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  toggleLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  vehicleIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.driverLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.driverLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: 6,
  },
  vehicleBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.driver,
  },
  vehicleNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  vehicleDetail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
})

export default DriverHomeScreen
