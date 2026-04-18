import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TextInputProps,
} from 'react-native'
import { Colors } from '../constants/colors'
import { FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  icon?: React.ReactNode
  isPassword?: boolean
  helperText?: string
}

export function Input({
  label,
  error,
  icon,
  isPassword,
  helperText,
  ...textInputProps
}: InputProps) {
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(isPassword ?? false)

  const borderColor = error
    ? Colors.danger
    : focused
    ? Colors.borderFocus
    : Colors.border

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          { borderColor },
          focused && !error && styles.inputWrapperFocused,
        ]}>
        {icon ? <View style={styles.iconLeft}>{icon}</View> : null}

        <TextInput
          {...textInputProps}
          secureTextEntry={hidden}
          placeholderTextColor={Colors.textTertiary}
          onFocus={e => {
            setFocused(true)
            textInputProps.onFocus?.(e)
          }}
          onBlur={e => {
            setFocused(false)
            textInputProps.onBlur?.(e)
          }}
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            textInputProps.style,
          ]}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setHidden(!hidden)}
            style={styles.iconRight}
            hitSlop={8}>
            <Text style={styles.toggleText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>

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
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  inputWrapperFocused: {
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm + 4,
  },
  inputWithIcon: {
    marginLeft: Spacing.sm,
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    paddingLeft: Spacing.sm,
  },
  toggleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.secondary,
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
