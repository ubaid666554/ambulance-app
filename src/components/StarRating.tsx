import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Star } from './Icons'
import { Colors } from '../constants/colors'
import { StarValue } from '../types/rating'

interface StarRatingProps {
  value: number
  onChange?: (value: StarValue) => void
  size?: number
  readonly?: boolean
  color?: string
}

export function StarRating({
  value,
  onChange,
  size = 32,
  readonly = false,
  color = '#F59E0B',
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5] as StarValue[]

  return (
    <View style={styles.row}>
      {stars.map(star => {
        const filled = star <= Math.round(value)
        const starElement = (
          <Star
            size={size}
            color={filled ? color : Colors.border}
            filled={filled}
            strokeWidth={2}
          />
        )

        if (readonly || !onChange) {
          return (
            <View key={star} style={styles.star}>
              {starElement}
            </View>
          )
        }

        return (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            style={styles.star}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}>
            {starElement}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    padding: 2,
  },
})
