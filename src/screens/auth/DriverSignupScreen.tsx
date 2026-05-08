import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Asset } from 'react-native-image-picker'
import { RootStackParamList } from '../../types/navigation'
import { VehicleType } from '../../types/user'
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
import { StepIndicator } from '../../components/StepIndicator'
import {
  ArrowLeft,
  Lock,
  User,
  Phone,
  IdCard,
  Car,
  Siren,
  ChevronRight,
  CheckCircle,
} from '../../components/Icons'
import {
  completeDriverSignup,
  sendOtpToPhone,
  verifyOtp,
  getFriendlyAuthError,
  OtpConfirmation,
} from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import auth from '@react-native-firebase/auth'
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
  validatePakistanPhone,
  validateCNIC,
  validateLicenseNumber,
  validateVehicleNumber,
  formatPakistanPhone,
  formatCNIC,
  getPasswordStrength,
} from '../../utils/validators'

type Props = NativeStackScreenProps<RootStackParamList, 'DriverSignup'>

const TOTAL_STEPS = 6
const STEP_LABELS = [
  'Phone Number',
  'Verify OTP',
  'Account Details',
  'Identity',
  'License',
  'Vehicle',
]

const VEHICLE_TYPES: {
  key: VehicleType
  label: string
  description: string
}[] = [
  { key: 'basic', label: 'Basic', description: 'Non-emergency transport' },
  { key: 'icu', label: 'ICU', description: 'Critical care equipped' },
  { key: 'cardiac', label: 'Cardiac', description: 'Heart emergencies' },
]

const RESEND_SECONDS = 60

function DriverSignupScreen({ navigation }: Props) {
  const { setSignupPending } = useAuth()

  const [step, setStep] = useState(1)

  const [phone, setPhone] = useState('')
  const [confirmation, setConfirmation] = useState<OtpConfirmation | null>(null)
  const [otp, setOtp] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [cnic, setCnic] = useState('')
  const [cnicPhoto, setCnicPhoto] = useState<Asset | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<Asset | null>(null)

  const [licenseNumber, setLicenseNumber] = useState('')
  const [licensePhoto, setLicensePhoto] = useState<Asset | null>(null)

  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleRegPhoto, setVehicleRegPhoto] = useState<Asset | null>(null)
  const [vehicleType, setVehicleType] = useState<VehicleType>('basic')

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const otpRefs = useRef<Array<TextInput | null>>([])

  const passwordStrength = getPasswordStrength(password)

  useEffect(() => {
    if (resendSeconds <= 0) return
    const t = setTimeout(() => setResendSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendSeconds])

  const setError = (key: string, err: string | null) =>
    setErrors(prev => ({ ...prev, [key]: err }))

  const handleSendOtp = async () => {
    setSubmitError(null)
    const err = validatePakistanPhone(phone)
    if (err) {
      setError('phone', err)
      return
    }
    setLoading(true)
    setSignupPending(true)
    try {
      const conf = await sendOtpToPhone(phone)
      setConfirmation(conf)
      setResendSeconds(RESEND_SECONDS)
      setOtp('')
      setStep(2)
    } catch (error: any) {
      const friendly = getFriendlyAuthError(error.code)
      setSubmitError(
        friendly === 'Something went wrong. Please try again'
          ? `${error.message ?? 'OTP failed'} (${error.code ?? 'no code'})`
          : friendly,
      )
      setSignupPending(false)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendSeconds > 0) return
    setLoading(true)
    try {
      const conf = await sendOtpToPhone(phone)
      setConfirmation(conf)
      setResendSeconds(RESEND_SECONDS)
      setOtp('')
    } catch (error: any) {
      setSubmitError(getFriendlyAuthError(error.code))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setSubmitError(null)
    if (otp.length !== 6) {
      setError('otp', 'Enter the full 6-digit OTP')
      return
    }
    if (!confirmation) {
      setSubmitError('OTP session expired. Please go back and resend.')
      return
    }

    setLoading(true)
    try {
      await verifyOtp(confirmation, otp)
      setStep(3)
    } catch (error: any) {
      setSubmitError(getFriendlyAuthError(error.code))
    } finally {
      setLoading(false)
    }
  }

  const validateStep = (current: number): boolean => {
    const newErrors: Record<string, string | null> = {}

    if (current === 3) {
      newErrors.name = validateName(name)
      newErrors.password = validatePassword(password)
      newErrors.confirmPassword = validateConfirmPassword(
        password,
        confirmPassword,
      )
    } else if (current === 4) {
      newErrors.cnic = validateCNIC(cnic)
      if (!cnicPhoto) newErrors.cnicPhoto = 'CNIC photo is required'
      if (!profilePhoto) newErrors.profilePhoto = 'Profile photo is required'
    } else if (current === 5) {
      newErrors.licenseNumber = validateLicenseNumber(licenseNumber)
      if (!licensePhoto) newErrors.licensePhoto = 'License photo is required'
    } else if (current === 6) {
      newErrors.vehicleNumber = validateVehicleNumber(vehicleNumber)
      if (!vehicleRegPhoto)
        newErrors.vehicleRegPhoto = 'Registration photo is required'
    }

    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.values(newErrors).every(e => !e)
  }

  const goNext = () => {
    if (step === 1) {
      handleSendOtp()
      return
    }
    if (step === 2) {
      handleVerifyOtp()
      return
    }
    if (!validateStep(step)) return
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  const goBack = async () => {
    if (step === 1) {
      navigation.goBack()
      return
    }
    if (step === 3 || step === 4 || step === 5 || step === 6) {
      if (step === 3 && auth().currentUser) {
        try {
          await auth().signOut()
        } catch {}
        setConfirmation(null)
      }
    }
    setStep(s => s - 1)
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    if (!validateStep(6)) return

    setLoading(true)
    try {
      await completeDriverSignup({
        name,
        phone,
        password,
        cnic,
        licenseNumber,
        vehicleType,
        vehicleNumber,
        profilePhotoUri: profilePhoto?.uri,
        cnicPhotoUri: cnicPhoto?.uri,
        licensePhotoUri: licensePhoto?.uri,
        vehicleRegPhotoUri: vehicleRegPhoto?.uri,
      })

      setLoading(false)
      Alert.alert(
        'Account Created',
        'Your driver account is ready. Please sign in with your phone and password.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              setSignupPending(false)
              navigation.replace('Login', { role: 'driver' })
            },
          },
        ],
        { cancelable: false },
      )
    } catch (error: any) {
      setSubmitError(
        error.message ?? getFriendlyAuthError(error.code) ?? 'Signup failed',
      )
      setLoading(false)
    }
  }

  const handleOtpChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setOtp(cleaned)
    if (errors.otp) setError('otp', null)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>Enter your phone number</Text>
            <Text style={styles.sectionHint}>
              We'll send a 6-digit code to verify your number. You'll use this
              number to sign in.
            </Text>

            <Input
              label="Phone Number"
              placeholder="+92 300 1234567"
              value={phone}
              onChangeText={v => setPhone(formatPakistanPhone(v))}
              keyboardType="phone-pad"
              error={errors.phone ?? undefined}
              icon={<Phone size={20} color={Colors.textTertiary} />}
              autoFocus
            />
          </View>
        )

      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>Verify your phone</Text>
            <Text style={styles.sectionHint}>
              Enter the 6-digit code we sent to{' '}
              <Text style={styles.phoneStrong}>{phone}</Text>
            </Text>

            <View style={styles.otpRow}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.otpBox,
                    otp[i] && styles.otpBoxFilled,
                    errors.otp && styles.otpBoxError,
                  ]}>
                  <Text style={styles.otpDigit}>{otp[i] ?? ''}</Text>
                </View>
              ))}
            </View>

            <TextInput
              style={styles.otpHiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              caretHidden
            />

            {errors.otp ? (
              <Text style={styles.otpError}>{errors.otp}</Text>
            ) : null}

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive code?</Text>
              {resendSeconds > 0 ? (
                <Text style={styles.resendTimer}>Resend in {resendSeconds}s</Text>
              ) : (
                <Pressable onPress={handleResendOtp} hitSlop={8}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </Pressable>
              )}
            </View>
          </View>
        )

      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>Create your account</Text>
            <Text style={styles.sectionHint}>
              Tell us your name and set a password
            </Text>

            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name ?? undefined}
              icon={<User size={20} color={Colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Min. 8 chars with A-Z, a-z, 0-9"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
              error={errors.password ?? undefined}
              icon={<Lock size={20} color={Colors.textTertiary} />}
            />

            {password ? (
              <View style={styles.strengthRow}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthLabel,
                    { color: passwordStrength.color },
                  ]}>
                  {passwordStrength.label}
                </Text>
              </View>
            ) : null}

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
              error={errors.confirmPassword ?? undefined}
              icon={<Lock size={20} color={Colors.textTertiary} />}
            />
          </View>
        )

      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>Identity verification</Text>
            <Text style={styles.sectionHint}>
              Upload your CNIC and a clear profile picture
            </Text>

            <Input
              label="CNIC Number"
              placeholder="12345-1234567-1"
              value={cnic}
              onChangeText={v => setCnic(formatCNIC(v))}
              keyboardType="number-pad"
              error={errors.cnic ?? undefined}
              icon={<IdCard size={20} color={Colors.textTertiary} />}
            />

            <PhotoUpload
              label="CNIC Photo (front)"
              helperText="Clear photo showing all details"
              value={cnicPhoto}
              onChange={v => {
                setCnicPhoto(v)
                setError('cnicPhoto', null)
              }}
              error={errors.cnicPhoto ?? undefined}
              aspectRatio={1.6}
            />

            <PhotoUpload
              label="Profile Picture"
              helperText="A recent photo of you"
              value={profilePhoto}
              onChange={v => {
                setProfilePhoto(v)
                setError('profilePhoto', null)
              }}
              error={errors.profilePhoto ?? undefined}
              aspectRatio={1}
            />
          </View>
        )

      case 5:
        return (
          <View>
            <Text style={styles.sectionTitle}>Driving license</Text>
            <Text style={styles.sectionHint}>
              Provide your valid driving license details
            </Text>

            <Input
              label="License Number"
              placeholder="DL-1234567890"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              autoCapitalize="characters"
              error={errors.licenseNumber ?? undefined}
              icon={<IdCard size={20} color={Colors.textTertiary} />}
            />

            <PhotoUpload
              label="License Photo"
              helperText="Clear photo of your driving license"
              value={licensePhoto}
              onChange={v => {
                setLicensePhoto(v)
                setError('licensePhoto', null)
              }}
              error={errors.licensePhoto ?? undefined}
              aspectRatio={1.6}
            />
          </View>
        )

      case 6:
        return (
          <View>
            <Text style={styles.sectionTitle}>Vehicle details</Text>
            <Text style={styles.sectionHint}>
              Tell us about your ambulance
            </Text>

            <Input
              label="Vehicle Number"
              placeholder="ABC-1234"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
              error={errors.vehicleNumber ?? undefined}
              icon={<Car size={20} color={Colors.textTertiary} />}
            />

            <PhotoUpload
              label="Vehicle Registration Photo"
              helperText="Front of the registration document"
              value={vehicleRegPhoto}
              onChange={v => {
                setVehicleRegPhoto(v)
                setError('vehicleRegPhoto', null)
              }}
              error={errors.vehicleRegPhoto ?? undefined}
              aspectRatio={1.6}
            />

            <Text style={styles.fieldLabel}>Ambulance Type</Text>
            <View style={styles.vehicleTypeGrid}>
              {VEHICLE_TYPES.map(v => {
                const selected = vehicleType === v.key
                return (
                  <Pressable
                    key={v.key}
                    onPress={() => setVehicleType(v.key)}
                    style={[
                      styles.vehicleTypeCard,
                      selected && styles.vehicleTypeCardSelected,
                    ]}>
                    <Text
                      style={[
                        styles.vehicleTypeLabel,
                        selected && styles.vehicleTypeLabelSelected,
                      ]}>
                      {v.label}
                    </Text>
                    <Text
                      style={[
                        styles.vehicleTypeDesc,
                        selected && styles.vehicleTypeDescSelected,
                      ]}>
                      {v.description}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        )
    }
  }

  const isLastStep = step === TOTAL_STEPS
  const primaryTitle =
    step === 1
      ? 'Send OTP'
      : step === 2
      ? 'Verify'
      : isLastStep
      ? 'Create Driver Account'
      : 'Continue'
  const onPrimary = isLastStep ? handleSubmit : goNext

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
              onPress={goBack}
              style={styles.backButton}
              hitSlop={8}
              accessibilityLabel="Go back">
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </Pressable>

            <View style={styles.brandBadge}>
              <Siren size={20} color={Colors.driver} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.title}>Become a driver</Text>

          <StepIndicator
            currentStep={step}
            totalSteps={TOTAL_STEPS}
            stepLabel={STEP_LABELS[step - 1]}
          />

          {renderStep()}

          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <Button
            title={primaryTitle}
            onPress={onPrimary}
            loading={loading}
            variant="secondary"
            iconRight={
              !isLastStep && step > 2 && !loading ? (
                <ChevronRight
                  size={20}
                  color={Colors.textLight}
                  strokeWidth={2.5}
                />
              ) : step === 2 && !loading ? (
                <CheckCircle
                  size={20}
                  color={Colors.textLight}
                  strokeWidth={2.5}
                />
              ) : undefined
            }
            style={styles.submitButton}
          />

          {step === 1 ? (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable
                onPress={() =>
                  navigation.replace('Login', { role: 'driver' })
                }
                hitSlop={8}>
                <Text style={styles.footerLink}> Sign in</Text>
              </Pressable>
            </View>
          ) : null}

          {isLastStep ? (
            <Text style={styles.terms}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Text>
          ) : null}
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
    backgroundColor: Colors.driverLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.huge,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  phoneStrong: {
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.driver,
    backgroundColor: Colors.driverLight,
  },
  otpBoxError: {
    borderColor: Colors.danger,
  },
  otpDigit: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
  },
  otpHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpError: {
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  resendText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  resendTimer: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
  },
  resendLink: {
    fontSize: FontSize.sm,
    color: Colors.driver,
    fontWeight: FontWeight.bold,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  strengthLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    minWidth: 50,
  },
  vehicleTypeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  vehicleTypeCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  vehicleTypeCardSelected: {
    backgroundColor: Colors.driverLight,
    borderColor: Colors.driver,
  },
  vehicleTypeLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  vehicleTypeLabelSelected: {
    color: Colors.driver,
  },
  vehicleTypeDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  vehicleTypeDescSelected: {
    color: Colors.driver,
  },
  errorBanner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontSize: FontSize.sm,
    color: Colors.primaryDark,
    fontWeight: FontWeight.medium,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  terms: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.driver,
  },
})

export default DriverSignupScreen
