import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../../types/navigation'
import { VehicleType, PatientProfile } from '../../types/user'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../../constants/theme'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import {
  ArrowLeft,
  MapPin,
  Siren,
  FileText,
  Navigation,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import { createBooking } from '../../services/booking'

type Props = NativeStackScreenProps<RootStackParamList, 'RequestAmbulance'>

const VEHICLE_TYPES: {
  key: VehicleType
  label: string
  description: string
  eta: string
}[] = [
  {
    key: 'basic',
    label: 'Basic',
    description: 'Standard transport',
    eta: '~8 min',
  },
  {
    key: 'icu',
    label: 'ICU',
    description: 'Critical care equipped',
    eta: '~10 min',
  },
  {
    key: 'cardiac',
    label: 'Cardiac',
    description: 'Heart emergencies',
    eta: '~12 min',
  },
]

const POPULAR_HOSPITALS = [
  'Services Hospital',
  'Mayo Hospital',
  'Jinnah Hospital',
  'Shaukat Khanum',
  'Sir Ganga Ram Hospital',
]

function RequestAmbulanceScreen({ navigation }: Props) {
  const { user, profile } = useAuth()
  const patient = profile as PatientProfile | null

  const [pickupAddress, setPickupAddress] = useState('')
  const [destinationAddress, setDestinationAddress] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('basic')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | null>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {}
    if (!pickupAddress.trim())
      newErrors.pickupAddress = 'Pickup address is required'
    else if (pickupAddress.trim().length < 6)
      newErrors.pickupAddress = 'Please provide more detail'

    if (!destinationAddress.trim())
      newErrors.destinationAddress = 'Destination is required'
    else if (destinationAddress.trim().length < 3)
      newErrors.destinationAddress = 'Please provide more detail'

    setErrors(newErrors)
    return Object.values(newErrors).every(e => !e)
  }

  const handleSubmit = async () => {
    if (!user || !patient) {
      Alert.alert('Error', 'You must be signed in')
      return
    }
    if (!validate()) return

    setLoading(true)
    try {
      const bookingId = await createBooking({
        patientId: user.uid,
        patientName: patient.name,
        patientPhone: patient.phone,
        pickupAddress,
        destinationAddress,
        requestedVehicleType: vehicleType,
        notes,
      })
      navigation.replace('BookingStatus', { bookingId })
    } catch (error: any) {
      Alert.alert(
        'Could not create booking',
        error.message ?? 'Please try again',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={8}
              accessibilityLabel="Go back">
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </Pressable>

            <View style={styles.brandBadge}>
              <Siren size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.title}>Request an ambulance</Text>
          <Text style={styles.subtitle}>
            Fill in the details and we'll dispatch the nearest driver
          </Text>

          <Text style={styles.sectionLabel}>Location</Text>

          <Input
            label="Pickup Address"
            placeholder="Your current address or landmark"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            autoCapitalize="sentences"
            error={errors.pickupAddress ?? undefined}
            helperText="Be specific — helps driver find you faster"
            icon={<MapPin size={20} color={Colors.primary} />}
          />

          <Input
            label="Destination (hospital)"
            placeholder="Hospital name or address"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
            autoCapitalize="words"
            error={errors.destinationAddress ?? undefined}
            icon={<Navigation size={20} color={Colors.success} />}
          />

          <View style={styles.chipsRow}>
            <Text style={styles.chipsLabel}>Quick pick:</Text>
            {POPULAR_HOSPITALS.map(h => (
              <Pressable
                key={h}
                onPress={() => setDestinationAddress(h)}
                style={({ pressed }) => [
                  styles.chip,
                  pressed && styles.chipPressed,
                ]}>
                <Text style={styles.chipText}>{h}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Ambulance Type</Text>

          <View style={styles.typeList}>
            {VEHICLE_TYPES.map(v => {
              const selected = vehicleType === v.key
              return (
                <Pressable
                  key={v.key}
                  onPress={() => setVehicleType(v.key)}
                  style={[
                    styles.typeCard,
                    selected && styles.typeCardSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}>
                  <View
                    style={[
                      styles.typeIcon,
                      selected && styles.typeIconSelected,
                    ]}>
                    <Siren
                      size={22}
                      color={selected ? Colors.textLight : Colors.primary}
                      strokeWidth={2.5}
                    />
                  </View>
                  <View style={styles.typeTextWrap}>
                    <Text
                      style={[
                        styles.typeLabel,
                        selected && styles.typeLabelSelected,
                      ]}>
                      {v.label}
                    </Text>
                    <Text
                      style={[
                        styles.typeDesc,
                        selected && styles.typeDescSelected,
                      ]}>
                      {v.description}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.typeEta,
                      selected && styles.typeEtaSelected,
                    ]}>
                    {v.eta}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.sectionLabel}>Emergency Details (optional)</Text>

          <View style={styles.notesWrap}>
            <View style={styles.notesIcon}>
              <FileText
                size={18}
                color={Colors.textTertiary}
                strokeWidth={2}
              />
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Describe the emergency, symptoms, patient condition..."
              placeholderTextColor={Colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{notes.length}/300</Text>

          <Button
            title="Request Ambulance"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <Text style={styles.disclaimer}>
            By requesting, you agree to our terms. For life-threatening
            emergencies, call 1122 immediately.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.huge,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  chipsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginRight: 2,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  chipPressed: {
    backgroundColor: Colors.secondaryLight,
    borderColor: Colors.secondary,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  typeList: {
    gap: Spacing.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconSelected: {
    backgroundColor: Colors.primary,
  },
  typeTextWrap: {
    flex: 1,
  },
  typeLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  typeLabelSelected: {
    color: Colors.primaryDark,
  },
  typeDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  typeDescSelected: {
    color: Colors.primaryDark,
  },
  typeEta: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
  },
  typeEtaSelected: {
    color: Colors.primary,
  },
  notesWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  notesIcon: {
    paddingTop: 2,
  },
  notesInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    minHeight: 80,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
  },
})

export default RequestAmbulanceScreen
