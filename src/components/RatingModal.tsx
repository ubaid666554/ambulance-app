import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { StarRating } from './StarRating'
import { Button } from './Button'
import { X, Siren } from './Icons'
import { Colors } from '../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme'
import { StarValue } from '../types/rating'
import { submitRating } from '../services/rating'
import { useAuth } from '../context/AuthContext'

interface RatingModalProps {
  visible: boolean
  onClose: () => void
  onSubmitted?: () => void
  driverId: string
  driverName: string
  vehicleNumber?: string
  bookingId?: string
}

const STAR_LABELS: Record<StarValue, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

export function RatingModal({
  visible,
  onClose,
  onSubmitted,
  driverId,
  driverName,
  vehicleNumber,
  bookingId,
}: RatingModalProps) {
  const { user, profile } = useAuth()

  const [stars, setStars] = useState<StarValue | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!visible) {
      setStars(null)
      setComment('')
      setSubmitting(false)
    }
  }, [visible])

  const handleSubmit = async () => {
    if (!user || !profile) {
      Alert.alert('Error', 'You must be signed in to submit a rating')
      return
    }
    if (!stars) {
      Alert.alert('Select Rating', 'Please tap a star to rate the driver')
      return
    }

    setSubmitting(true)
    try {
      await submitRating({
        driverId,
        driverName,
        patientId: user.uid,
        patientName: profile.name,
        stars,
        comment: comment.trim() || undefined,
        bookingId,
      })

      Alert.alert('Thank you!', 'Your rating has been submitted.', [
        {
          text: 'OK',
          onPress: () => {
            onSubmitted?.()
            onClose()
          },
        },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not submit rating. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdropPress} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Rate your driver</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={8}
              accessibilityLabel="Close">
              <X size={20} color={Colors.textSecondary} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.driverCard}>
            <View style={styles.driverIconWrap}>
              <Siren size={24} color={Colors.driver} strokeWidth={2.5} />
            </View>
            <View style={styles.driverTextWrap}>
              <Text style={styles.driverName}>{driverName}</Text>
              {vehicleNumber ? (
                <Text style={styles.vehicleNumber}>{vehicleNumber}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.prompt}>How was your experience?</Text>

          <View style={styles.starsContainer}>
            <StarRating
              value={stars ?? 0}
              onChange={setStars}
              size={44}
            />
            <Text style={styles.starLabel}>
              {stars ? STAR_LABELS[stars] : 'Tap to rate'}
            </Text>
          </View>

          <Text style={styles.fieldLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience..."
            placeholderTextColor={Colors.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{comment.length}/200</Text>

          <Button
            title="Submit Rating"
            onPress={handleSubmit}
            loading={submitting}
            disabled={!stars}
            style={styles.submitButton}
          />

          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    ...Shadow.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  driverIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.driverLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverTextWrap: {
    flex: 1,
  },
  driverName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  prompt: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  starLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  commentInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginBottom: Spacing.sm,
  },
  skipText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    paddingVertical: Spacing.sm,
  },
})
