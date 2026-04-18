import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '../constants/colors'
import { FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme'

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabel: string
}

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabel,
}: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.stepNumber}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.stepLabel}>{stepLabel}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.driver,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  track: {
    height: 6,
    backgroundColor: Colors.divider,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.driver,
    borderRadius: BorderRadius.full,
  },
})
