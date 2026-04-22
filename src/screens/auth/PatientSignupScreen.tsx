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
import { RootStackParamList } from '../../types/navigation'
import { Colors } from '../../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '../../constants/theme'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  HeartPulse,
} from '../../components/Icons'
import { signUpPatient, getFriendlyAuthError } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validatePakistanPhone,
  formatPakistanPhone,
  getPasswordStrength,
} from '../../utils/validators'

type Props = NativeStackScreenProps<RootStackParamList, 'PatientSignup'>

function PatientSignupScreen({ navigation }: Props) {
  const { setSignupPending } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordStrength = getPasswordStrength(password)

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      name: validateName(name),
      email: validateEmail(email),
      phone: validatePakistanPhone(phone),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }
    setErrors(newErrors)
    return Object.values(newErrors).every(e => !e)
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    if (!validate()) return

    setLoading(true)
    setSignupPending(true)
    try {
      await signUpPatient({ name, email, phone, password })

      setLoading(false)
      Alert.alert(
        'Account Created',
        'Your patient account is ready. Please sign in to continue.',
        [
          {
            text: 'Sign In',
            onPress: () => {
              setSignupPending(false)
              navigation.replace('Login', { role: 'patient' })
            },
          },
        ],
        { cancelable: false },
      )
    } catch (error: any) {
      setSignupPending(false)
      setSubmitError(getFriendlyAuthError(error.code))
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
              <HeartPulse size={20} color={Colors.patient} strokeWidth={2.5} />
            </View>
          </View>

          <Text style={styles.title}>Create patient account</Text>
          <Text style={styles.subtitle}>
            Just the basics — you can add profile details anytime from your
            account
          </Text>

          <Input
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name ?? undefined}
            icon={<User size={20} color={Colors.textTertiary} />}
          />

          <Input
            label="Email"
            placeholder="you@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email ?? undefined}
            icon={<Mail size={20} color={Colors.textTertiary} />}
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

          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleSubmit}
            loading={loading}
            style={[styles.submitButton, { backgroundColor: Colors.patient }]}
          />

          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              onPress={() => navigation.replace('Login', { role: 'patient' })}
              hitSlop={8}>
              <Text style={styles.footerLink}> Sign in</Text>
            </Pressable>
          </View>
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
    backgroundColor: Colors.patientLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.huge,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
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
    color: Colors.patient,
  },
})

export default PatientSignupScreen
