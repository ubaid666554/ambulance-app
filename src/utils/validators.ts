const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'live.com',
  'protonmail.com',
]

export function validateName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Full name is required'
  if (trimmed.length < 3) return 'Name must be at least 3 characters'
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed))
    return 'Name can only contain letters, spaces, and - . \''
  return null
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
    return 'Enter a valid email address'

  const domain = trimmed.split('@')[1]
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain))
    return `Only ${ALLOWED_EMAIL_DOMAINS.slice(0, 4).join(', ')}, etc. are accepted`

  return null
}

export function formatPakistanPhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('92')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 10)

  if (digits.length === 0) return ''
  if (digits.length <= 3) return `+92 ${digits}`
  return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`
}

export function normalizePakistanPhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('92')) return `+${digits}`
  if (digits.startsWith('0')) return `+92${digits.slice(1)}`
  if (digits.length === 10) return `+92${digits}`
  return `+${digits}`
}

export function phoneToFakeEmail(phone: string): string {
  const normalized = phone.replace(/\D/g, '')
  return `${normalized}@medirush.app`
}

export function validatePakistanPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'Phone number is required'

  let normalized = digits
  if (normalized.startsWith('92')) normalized = normalized.slice(2)
  else if (normalized.startsWith('0')) normalized = normalized.slice(1)

  if (normalized.length !== 10)
    return 'Phone must be 10 digits after +92 (e.g., +92 300 1234567)'

  if (!normalized.startsWith('3'))
    return 'Pakistan mobile numbers start with 3 after country code'

  return null
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(value))
    return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(value))
    return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(value))
    return 'Password must contain at least one number'
  return null
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export function formatCNIC(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}

export function validateCNIC(value: string): string | null {
  if (!value.trim()) return 'CNIC is required'
  if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(value))
    return 'Enter a valid CNIC (e.g., 12345-1234567-1)'
  return null
}

export function validateLicenseNumber(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'License number is required'
  if (trimmed.length < 6) return 'License number must be at least 6 characters'
  if (!/^[A-Z0-9-]+$/i.test(trimmed))
    return 'License can only contain letters, numbers, and dashes'
  return null
}

export function validateVehicleNumber(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Vehicle number is required'
  if (trimmed.length < 4) return 'Enter a valid vehicle number'
  if (!/^[A-Z0-9-\s]+$/i.test(trimmed))
    return 'Vehicle number can only contain letters, numbers, and dashes'
  return null
}

export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: 'Weak', color: '#DC2626' }
  if (score <= 4) return { score, label: 'Medium', color: '#F59E0B' }
  return { score, label: 'Strong', color: '#059669' }
}
