import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import { UserProfile } from '../types/user'

interface AuthContextValue {
  user: FirebaseAuthTypes.User | null
  profile: UserProfile | null
  initializing: boolean
  signupPending: boolean
  setSignupPending: (pending: boolean) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [signupPending, setSignupPending] = useState(false)
  const signupPendingRef = useRef(false)

  useEffect(() => {
    signupPendingRef.current = signupPending
  }, [signupPending])

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(currentUser => {
      if (signupPendingRef.current) {
        setInitializing(false)
        return
      }
      setUser(currentUser)
      if (!currentUser) {
        setProfile(null)
        setInitializing(false)
      }
    })
    return unsubscribeAuth
  }, [])

  useEffect(() => {
    if (!user) return

    const unsubscribeProfile = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(
        doc => {
          if (doc.exists) {
            setProfile(doc.data() as UserProfile)
          } else {
            setProfile(null)
          }
          setInitializing(false)
        },
        error => {
          console.error('Profile listener error:', error)
          setProfile(null)
          setInitializing(false)
        },
      )

    return unsubscribeProfile
  }, [user])

  const signOut = async () => {
    await auth().signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        initializing,
        signupPending,
        setSignupPending,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
