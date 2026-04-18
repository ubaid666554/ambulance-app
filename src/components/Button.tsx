import React, { useRef } from 'react'
import {
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { Colors } from '../constants/colors'
import {
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
  Shadow,
} from '../constants/theme'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost'

interface ButtonProps {
  onPress: () => void
  title: string
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  iconLeft,
  iconRight,
  style,
  textStyle,
}: ButtonProps) {
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

  const isDisabled = disabled || loading

  const containerStyle = [
    styles.base,
    variantStyles[variant].container,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ]

  const labelStyle = [
    styles.text,
    variantStyles[variant].text,
    isDisabled && styles.disabledText,
    textStyle,
  ]

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={isDisabled ? undefined : handlePressIn}
        onPressOut={isDisabled ? undefined : handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={containerStyle}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? Colors.textLight : Colors.primary}
          />
        ) : (
          <View style={styles.content}>
            {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
            <Text style={labelStyle}>{title}</Text>
            {iconRight ? (
              <View style={styles.iconRight}>{iconRight}</View>
            ) : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
})

const variantStyles = {
  primary: StyleSheet.create({
    container: {
      backgroundColor: Colors.primary,
      ...Shadow.md,
    },
    text: { color: Colors.textLight },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: Colors.secondary,
      ...Shadow.md,
    },
    text: { color: Colors.textLight },
  }),
  outline: StyleSheet.create({
    container: {
      backgroundColor: Colors.transparent,
      borderWidth: 1.5,
      borderColor: Colors.primary,
    },
    text: { color: Colors.primary },
  }),
  ghost: StyleSheet.create({
    container: {
      backgroundColor: Colors.transparent,
    },
    text: { color: Colors.primary },
  }),
}
