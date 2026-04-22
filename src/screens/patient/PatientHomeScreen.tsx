import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  Image as RNImage,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigation'
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
  Droplet,
  Phone,
  MapPin,
  LogOut,
  Clock,
  ShieldCheck,
  UserPlus,
  ChevronRight,
  IdCard,
  User,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import { PatientProfile } from '../../types/user'
import { subscribeToPatientActiveBooking } from '../../services/booking'

type NavProp = NativeStackNavigationProp<RootStackParamList>

function PatientHomeScreen() {
  const navigation = useNavigation<NavProp>()
  const { user, profile, signOut } = useAuth()
  const patient = profile as PatientProfile | null

  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToPatientActiveBooking(user.uid, booking => {
      if (booking) {
        navigation.navigate('BookingStatus', { bookingId: booking.id })
      }
    })
    return unsub
  }, [user, navigation])

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [pulseAnim])

  const handleRequestAmbulance = () => {
    navigation.navigate('RequestAmbulance')
  }

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const hasBloodGroup = !!patient.bloodGroup
  const hasCnic = !!patient.cnic
  const hasPhoto = !!patient.profilePhotoUri
  const hasEmergencyContact =
    !!patient.emergencyContactName && !!patient.emergencyContactPhone

  const missingFieldCount =
    (hasBloodGroup ? 0 : 1) +
    (hasCnic ? 0 : 1) +
    (hasPhoto ? 0 : 1) +
    (hasEmergencyContact ? 0 : 1)
  const showCompletePrompt = missingFieldCount > 0

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {hasPhoto ? (
              <RNImage
                source={{ uri: patient.profilePhotoUri }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={22} color={Colors.textSecondary} strokeWidth={2.5} />
              </View>
            )}
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.name}>{patient.name}</Text>
            </View>
          </View>

          <Pressable
            onPress={handleSignOut}
            style={styles.logoutButton}
            hitSlop={8}
            accessibilityLabel="Sign out">
            <LogOut size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {showCompletePrompt ? (
          <Pressable
            onPress={handleEditProfile}
            style={({ pressed }) => [
              styles.completeBanner,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Complete your profile">
            <View style={styles.completeIconWrap}>
              <UserPlus
                size={20}
                color={Colors.secondary}
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.completeTextWrap}>
              <Text style={styles.completeTitle}>Complete your profile</Text>
              <Text style={styles.completeSubtitle}>
                Add {missingFieldCount} missing{' '}
                {missingFieldCount === 1 ? 'item' : 'items'} for faster
                emergencies
              </Text>
            </View>
            <ChevronRight
              size={20}
              color={Colors.secondary}
              strokeWidth={2.5}
            />
          </Pressable>
        ) : null}

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Need an ambulance?</Text>
          <Text style={styles.heroSubtitle}>
            Tap the button to dispatch the nearest ambulance to your location
          </Text>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleRequestAmbulance}
              style={({ pressed }) => [
                styles.requestButton,
                pressed && styles.requestButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Request ambulance">
              <View style={styles.requestIconWrapper}>
                <Siren size={32} color={Colors.textLight} strokeWidth={2.5} />
              </View>
              <Text style={styles.requestButtonText}>REQUEST AMBULANCE</Text>
              <Text style={styles.requestButtonHint}>
                Emergency dispatch in under 8 minutes
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors.primaryLight },
              ]}>
              <Clock size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>~8 min</Text>
            <Text style={styles.statLabel}>Avg. Response</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: Colors.successLight },
              ]}>
              <ShieldCheck size={18} color={Colors.success} strokeWidth={2.5} />
            </View>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <Pressable onPress={handleEditProfile} hitSlop={8}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors.primaryLight },
              ]}>
              <Droplet size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Blood Group</Text>
              {hasBloodGroup ? (
                <Text style={styles.infoValue}>{patient.bloodGroup}</Text>
              ) : (
                <Text style={styles.infoMissing}>Not set — tap Edit</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors.secondaryLight },
              ]}>
              <IdCard size={18} color={Colors.secondary} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>CNIC</Text>
              {hasCnic ? (
                <Text style={styles.infoValue}>{patient.cnic}</Text>
              ) : (
                <Text style={styles.infoMissing}>Not set — tap Edit</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoIcon,
                { backgroundColor: Colors.successLight },
              ]}>
              <Phone size={18} color={Colors.success} strokeWidth={2.5} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              {hasEmergencyContact ? (
                <>
                  <Text style={styles.infoValue}>
                    {patient.emergencyContactName}
                  </Text>
                  <Text style={styles.infoSubValue}>
                    {patient.emergencyContactPhone}
                  </Text>
                </>
              ) : (
                <Text style={styles.infoMissing}>Not set — tap Edit</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Bookings</Text>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MapPin size={32} color={Colors.textTertiary} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            Your ambulance booking history will appear here
          </Text>
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.divider,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontSize: FontSize.xl,
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
  completeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  cardPressed: {
    opacity: 0.85,
  },
  completeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTextWrap: {
    flex: 1,
  },
  completeTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.secondaryDark,
    marginBottom: 2,
  },
  completeSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.secondaryDark,
    lineHeight: 16,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  requestButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  requestButtonPressed: {
    opacity: 0.9,
  },
  requestIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  requestButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textLight,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  requestButtonHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.medium,
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
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  editLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.patient,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  infoMissing: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  infoSubValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
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

export default PatientHomeScreen
