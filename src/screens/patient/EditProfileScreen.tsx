import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Asset } from 'react-native-image-picker'
import { RootStackParamList } from '../../types/navigation'
import { BloodGroup, PatientProfile } from '../../types/user'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '../../constants/theme'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { PhotoUpload } from '../../components/PhotoUpload'
import {
  ArrowLeft,
  User,
  Phone,
  IdCard,
  Droplet,
  HeartPulse,
} from '../../components/Icons'
import { updatePatientProfile } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import {
  validateName,
  validatePakistanPhone,
  validateCNIC,
  formatPakistanPhone,
  formatCNIC,
} from '../../utils/validators'

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
  'Unknown',
]

function EditProfileScreen({ navigation }: Props) {
  const { user, profile } = useAuth()
  const patient = profile as PatientProfile | null

  const [name, setName] = useState(patient?.name ?? '')
  const [phone, setPhone] = useState(patient?.phone ?? '')
  const [cnic, setCnic] = useState(patient?.cnic ?? '')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(
    patient?.bloodGroup ?? 'Unknown',
  )
  const [emergencyContactName, setEmergencyContactName] = useState(
    patient?.emergencyContactName ?? '',
  )
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    patient?.emergencyContactPhone ?? '',
  )
  const [profilePhoto, setProfilePhoto] = useState<Asset | null>(null)

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string | null> = {}
    newErrors.name = validateName(name)
    newErrors.phone = validatePakistanPhone(phone)
    if (cnic.trim()) newErrors.cnic = validateCNIC(cnic)

    const hasEmergencyName = emergencyContactName.trim().length > 0
    const hasEmergencyPhone = emergencyContactPhone.trim().length > 0

    if (hasEmergencyName && emergencyContactName.trim().length < 3)
      newErrors.emergencyContactName = 'Name must be at least 3 characters'

    if (hasEmergencyPhone)
      newErrors.emergencyContactPhone = validatePakistanPhone(
        emergencyContactPhone,
      )

    if (hasEmergencyName && !hasEmergencyPhone)
      newErrors.emergencyContactPhone =
        'Add a phone number or clear the name field'
    if (hasEmergencyPhone && !hasEmergencyName)
      newErrors.emergencyContactName =
        'Add a name or clear the phone field'

    setErrors(newErrors)
    return Object.values(newErrors).every(e => !e)
  }

  const handleSave = async () => {
    if (!user) return
    if (!validate()) return

    setSaving(true)
    try {
      await updatePatientProfile(user.uid, {
        name,
        phone,
        cnic: cnic.trim() || undefined,
        bloodGroup: bloodGroup === 'Unknown' ? undefined : bloodGroup,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        profilePhotoUri: profilePhoto?.uri,
      })

      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not save profile. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    )
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
              <HeartPulse size={20} color={Colors.patient} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.title}>Edit profile</Text>
          <Text style={styles.subtitle}>
            Add or update your medical details and contact info
          </Text>

          <Text style={styles.sectionLabel}>Personal</Text>

          <PhotoUpload
            label="Profile Picture"
            helperText={
              patient.profilePhotoUri
                ? 'Upload to replace your current photo'
                : 'Optional — helps drivers identify you'
            }
            value={profilePhoto}
            onChange={setProfilePhoto}
            aspectRatio={1}
          />

          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name ?? undefined}
            icon={<User size={20} color={Colors.textTertiary} />}
          />

          <Input
            label="Phone"
            placeholder="+92 300 1234567"
            value={phone}
            onChangeText={v => setPhone(formatPakistanPhone(v))}
            keyboardType="phone-pad"
            error={errors.phone ?? undefined}
            icon={<Phone size={20} color={Colors.textTertiary} />}
          />

          <Input
            label="CNIC (optional)"
            placeholder="12345-1234567-1"
            value={cnic}
            onChangeText={v => setCnic(formatCNIC(v))}
            keyboardType="number-pad"
            error={errors.cnic ?? undefined}
            helperText="Your national ID — helps in emergencies"
            icon={<IdCard size={20} color={Colors.textTertiary} />}
          />

          <Text style={styles.sectionLabel}>Medical</Text>

          <Text style={styles.fieldLabel}>Blood Group</Text>
          <View style={styles.bloodGroupGrid}>
            {BLOOD_GROUPS.map(bg => {
              const selected = bloodGroup === bg
              return (
                <Pressable
                  key={bg}
                  onPress={() => setBloodGroup(bg)}
                  style={[
                    styles.bloodGroupChip,
                    selected && styles.bloodGroupChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}>
                  <Droplet
                    size={14}
                    color={selected ? Colors.textLight : Colors.primary}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.bloodGroupText,
                      selected && styles.bloodGroupTextSelected,
                    ]}>
                    {bg}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Text style={styles.sectionLabel}>Emergency Contact (optional)</Text>

          <Input
            label="Contact Name"
            placeholder="Father / spouse / friend"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            autoCapitalize="words"
            error={errors.emergencyContactName ?? undefined}
            helperText="Someone to notify in emergencies"
            icon={<User size={20} color={Colors.textTertiary} />}
          />

          <Input
            label="Contact Phone"
            placeholder="+92 300 1234567"
            value={emergencyContactPhone}
            onChangeText={v => setEmergencyContactPhone(formatPakistanPhone(v))}
            keyboardType="phone-pad"
            error={errors.emergencyContactPhone ?? undefined}
            icon={<Phone size={20} color={Colors.textTertiary} />}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            style={[styles.submitButton, { backgroundColor: Colors.patient }]}
          />

          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.patientLight,
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
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  bloodGroupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minWidth: 72,
  },
  bloodGroupChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bloodGroupText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  bloodGroupTextSelected: {
    color: Colors.textLight,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
})

export default EditProfileScreen
