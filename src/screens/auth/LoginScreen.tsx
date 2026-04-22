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
  Siren,
  HeartPulse,
  Phone,
} from '../../components/Icons'
import {
  signIn,
  signInDriverWithPhone,
  getFriendlyAuthError,
} from '../../services/auth'
import {
  formatPakistanPhone,
  validatePakistanPhone,
} from '../../utils/validators'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

function LoginScreen({ navigation, route }: Props) {
  const { role } = route.params
  const isDriver = role === 'driver'

  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{
    emailOrPhone?: string
    password?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const roleColor = isDriver ? Colors.driver : Colors.patient
  const roleBg = isDriver ? Colors.driverLight : Colors.patientLight

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = isDriver
        ? 'Phone number is required'
        : 'Email is required'
    } else if (isDriver) {
      const phoneErr = validatePakistanPhone(emailOrPhone)
      if (phoneErr) newErrors.emailOrPhone = phoneErr
    } else if (!/^\S+@\S+\.\S+$/.test(emailOrPhone)) {
      newErrors.emailOrPhone = 'Enter a valid email'
    }

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    setSubmitError(null)
    if (!validate()) return

    setLoading(true)
    try {
      if (isDriver) {
        await signInDriverWithPhone(emailOrPhone, password)
      } else {
        await signIn(emailOrPhone, password)
      }
    } catch (error: any) {
      setSubmitError(getFriendlyAuthError(error.code))
    } finally {
      setLoading(false)
    }
  }

  const handleSignupPress = () => {
    if (isDriver) {
      navigation.navigate('DriverSignup')
    } else {
      navigation.navigate('PatientSignup')
    }
  }

  const handleEmailOrPhoneChange = (value: string) => {
    if (isDriver) {
      setEmailOrPhone(formatPakistanPhone(value))
    } else {
      setEmailOrPhone(value)
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={8}
            accessibilityLabel="Go back">
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>

          <View style={[styles.iconBadge, { backgroundColor: roleBg }]}>
            {isDriver ? (
              <Siren size={36} color={roleColor} strokeWidth={2.5} />
            ) : (
              <HeartPulse size={36} color={roleColor} strokeWidth={2.5} />
            )}
          </View>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to your {role} account to continue
          </Text>

          <View style={styles.form}>
            <Input
              label={isDriver ? 'Phone Number' : 'Email'}
              placeholder={isDriver ? '+92 300 1234567' : 'you@example.com'}
              value={emailOrPhone}
              onChangeText={handleEmailOrPhoneChange}
              keyboardType={isDriver ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
              autoComplete={isDriver ? 'tel' : 'email'}
              error={errors.emailOrPhone}
              icon={
                isDriver ? (
                  <Phone size={20} color={Colors.textTertiary} />
                ) : (
                  <Mail size={20} color={Colors.textTertiary} />
                )
              }
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
              error={errors.password}
              icon={<Lock size={20} color={Colors.textTertiary} />}
            />

            <Pressable style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={handleSignupPress} hitSlop={8}>
              <Text style={[styles.footerLink, { color: roleColor }]}>
                {' '}Create one
              </Text>
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
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    lineHeight: 24,
  },
  form: {
    gap: Spacing.xs,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  forgotText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.secondary,
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
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
})

export default LoginScreen
