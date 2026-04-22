import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image as RNImage,
} from 'react-native'
import {
  Siren,
  PhoneCall,
  MessageSquare,
  Car,
  IdCard,
  User,
} from './Icons'
import { StarRating } from './StarRating'
import { DriverProfile } from '../types/user'
import { Colors } from '../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme'
import { callPhone, sendSMS } from '../utils/communication'

interface DriverDetailsCardProps {
  driver: DriverProfile
  showActions?: boolean
  etaMinutes?: number
}

export function DriverDetailsCard({
  driver,
  showActions = true,
  etaMinutes,
}: DriverDetailsCardProps) {
  const handleCall = () => {
    callPhone(driver.phone)
  }

  const handleMessage = () => {
    sendSMS(driver.phone, 'Hi, I am your patient for the ambulance booking.')
  }

  const vehicleTypeLabel =
    driver.vehicleType.charAt(0).toUpperCase() + driver.vehicleType.slice(1)

  return (
    <View style={styles.card}>
      <View style={styles.acceptedBanner}>
        <View style={styles.acceptedDot} />
        <Text style={styles.acceptedText}>DRIVER ACCEPTED</Text>
        {etaMinutes !== undefined ? (
          <Text style={styles.etaText}>ETA {etaMinutes} min</Text>
        ) : null}
      </View>

      <View style={styles.topRow}>
        {driver.documents?.profilePhotoUri ? (
          <RNImage
            source={{ uri: driver.documents.profilePhotoUri }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={28} color={Colors.textSecondary} strokeWidth={2.5} />
          </View>
        )}

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <StarRating value={driver.rating ?? 0} size={14} readonly />
            <Text style={styles.ratingText}>
              {(driver.rating ?? 0).toFixed(1)}
              {driver.totalRatings
                ? ` (${driver.totalRatings})`
                : ' (new)'}
            </Text>
          </View>
        </View>

        <View style={styles.typeBadge}>
          <Siren size={14} color={Colors.driver} strokeWidth={3} />
          <Text style={styles.typeBadgeText}>{vehicleTypeLabel}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Car size={16} color={Colors.secondary} strokeWidth={2.5} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoValue}>{driver.vehicleNumber}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <IdCard size={16} color={Colors.secondary} strokeWidth={2.5} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>License</Text>
            <Text style={styles.infoValue}>{driver.licenseNumber}</Text>
          </View>
        </View>
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionButton,
              styles.callButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Call ${driver.name}`}>
            <PhoneCall
              size={20}
              color={Colors.textLight}
              strokeWidth={2.5}
            />
            <Text style={styles.callButtonText}>Call Driver</Text>
          </Pressable>

          <Pressable
            onPress={handleMessage}
            style={({ pressed }) => [
              styles.actionButton,
              styles.messageButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Message ${driver.name}`}>
            <MessageSquare
              size={20}
              color={Colors.secondary}
              strokeWidth={2.5}
            />
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  acceptedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  acceptedText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.extrabold,
    color: Colors.success,
    letterSpacing: 1,
  },
  etaText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.divider,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.driverLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.driver,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  callButton: {
    backgroundColor: Colors.success,
    ...Shadow.sm,
  },
  callButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
    letterSpacing: 0.3,
  },
  messageButton: {
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  messageButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.secondary,
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
})
