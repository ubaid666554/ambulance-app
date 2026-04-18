import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image as RNImage,
  Alert,
} from 'react-native'
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker'
import { Camera, Image as ImageIcon, X } from './Icons'
import { Colors } from '../constants/colors'
import { FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme'

interface PhotoUploadProps {
  label: string
  helperText?: string
  value: Asset | null
  onChange: (asset: Asset | null) => void
  error?: string
  aspectRatio?: number
}

export function PhotoUpload({
  label,
  helperText,
  value,
  onChange,
  error,
  aspectRatio = 1.6,
}: PhotoUploadProps) {
  const handlePickFromLibrary = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        includeBase64: false,
      })

      if (result.didCancel) return
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage ?? 'Could not pick image')
        return
      }

      if (result.assets && result.assets[0]) {
        onChange(result.assets[0])
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not pick image')
    }
  }

  const handleTakePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1200,
        saveToPhotos: true,
        includeBase64: false,
      })

      if (result.didCancel) return
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage ?? 'Could not take photo')
        return
      }

      if (result.assets && result.assets[0]) {
        onChange(result.assets[0])
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not take photo')
    }
  }

  const handlePress = () => {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Gallery', onPress: handlePickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const handleRemove = () => {
    onChange(null)
  }

  const borderColor = error ? Colors.danger : Colors.border

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {value ? (
        <View style={[styles.preview, { aspectRatio }]}>
          <RNImage
            source={{ uri: value.uri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <Pressable
            onPress={handleRemove}
            style={styles.removeButton}
            hitSlop={8}
            accessibilityLabel="Remove photo">
            <X size={16} color={Colors.textLight} strokeWidth={3} />
          </Pressable>
          <Pressable
            onPress={handlePress}
            style={styles.replaceButton}
            accessibilityLabel="Replace photo">
            <Text style={styles.replaceText}>Replace</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePress}
          style={[styles.uploadBox, { borderColor, aspectRatio }]}
          accessibilityLabel={`Upload ${label}`}>
          <View style={styles.uploadIconWrapper}>
            <Camera size={28} color={Colors.secondary} strokeWidth={2.5} />
          </View>
          <Text style={styles.uploadTitle}>Tap to upload</Text>
          <Text style={styles.uploadSubtitle}>Camera or Gallery</Text>
        </Pressable>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  uploadBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  uploadIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  uploadTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  preview: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replaceButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  replaceText: {
    color: Colors.textLight,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
})
