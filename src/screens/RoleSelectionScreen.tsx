import React, { useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  HeartPulse,
  Siren,
  ChevronRight,
  ShieldCheck,
  Clock,
  MapPin,
} from '../components/Icons'
import { RootStackParamList } from '../types/navigation'
import { Colors } from '../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>

type Role = 'patient' | 'driver'

interface RoleCardProps {
  role: Role
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  color: string
  backgroundColor: string
  onPress: () => void
}

function RoleCard({
  title,
  subtitle,
  description,
  icon,
  color,
  backgroundColor,
  onPress,
}: RoleCardProps) {
  const scale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Select ${title} role`}
        style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor }]}>
          {icon}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>

        <View style={[styles.chevronContainer, { backgroundColor }]}>
          <ChevronRight size={20} color={color} strokeWidth={2.5} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

function RoleSelectionScreen({ navigation }: Props) {
  const handleRoleSelect = (role: Role) => {
    if (role === 'driver') {
      navigation.navigate('Login', { role: 'driver' })
    } else {
      Alert.alert(
        'Coming Soon',
        'Patient side is being built next. For now, try the Driver flow.',
      )
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Siren size={22} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.brandName}>MediRush</Text>
          </View>

          <Text style={styles.title}>How can we help you?</Text>
          <Text style={styles.subtitle}>
            Choose your role to get started with the app
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <RoleCard
            role="patient"
            subtitle="FOR PATIENTS"
            title="Request an Ambulance"
            description="Book emergency medical transport to the nearest hospital with one tap"
            icon={
              <HeartPulse
                size={32}
                color={Colors.patient}
                strokeWidth={2.5}
              />
            }
            color={Colors.patient}
            backgroundColor={Colors.patientLight}
            onPress={() => handleRoleSelect('patient')}
          />

          <RoleCard
            role="driver"
            subtitle="FOR DRIVERS"
            title="Drive an Ambulance"
            description="Accept emergency requests and help save lives in your community"
            icon={
              <Siren size={32} color={Colors.driver} strokeWidth={2.5} />
            }
            color={Colors.driver}
            backgroundColor={Colors.driverLight}
            onPress={() => handleRoleSelect('driver')}
          />
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Why choose MediRush?</Text>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Clock size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Rapid Response</Text>
              <Text style={styles.featureSubtitle}>
                Average arrival in under 8 minutes
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <ShieldCheck size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Verified Drivers</Text>
              <Text style={styles.featureSubtitle}>
                All drivers are licensed and trained
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <MapPin size={18} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Live Tracking</Text>
              <Text style={styles.featureSubtitle}>
                Real-time location updates
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          You can change your role anytime in settings
        </Text>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: FontSize.huge,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  cardsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    gap: Spacing.md,
    minHeight: 96,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardSubtitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  featuresTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  footer: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    paddingVertical: Spacing.md,
  },
})

export default RoleSelectionScreen
