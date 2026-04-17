import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ambulance } from '../components/Icons'
import { RootStackParamList } from '../types/navigation'
import { Colors } from '../constants/colors'
import { FontSize, FontWeight, Spacing } from '../constants/theme'

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>

function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()

    const timer = setTimeout(() => {
      navigation.replace('RoleSelection')
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigation, fadeAnim, scaleAnim, pulseAnim])

  return (
    <View style={styles.container}>
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circleTopRight]} />
        <View style={[styles.circle, styles.circleBottomLeft]} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}>
          <View style={styles.iconInner}>
            <Ambulance size={56} color={Colors.primary} strokeWidth={2.5} />
          </View>
        </Animated.View>

        <Text style={styles.title}>MediRush</Text>
        <Text style={styles.tagline}>Emergency care, one tap away</Text>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>Trusted by thousands of patients</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loaderDots}>
          <AnimatedDot delay={0} />
          <AnimatedDot delay={200} />
          <AnimatedDot delay={400} />
        </View>
      </Animated.View>
    </View>
  )
}

function AnimatedDot({ delay }: { delay: number }) {
  const dotAnim = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 500,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotAnim, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [dotAnim, delay])

  return <Animated.View style={[styles.dot, { opacity: dotAnim }]} />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleTopRight: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circleBottomLeft: {
    width: 400,
    height: 400,
    bottom: -150,
    left: -150,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extrabold,
    color: Colors.textLight,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.xl,
  },
  divider: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xxl,
    alignItems: 'center',
  },
  loaderDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
})

export default SplashScreen
