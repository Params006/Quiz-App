import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { supabase } from '../supabase'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    // small delay for better UX
    setTimeout(() => {
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }, 1500)
  }

  return (
    <View style={styles.container}>
      
      {/* App Title */}
      <Text style={styles.title}>Quiz App</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Loading your experience...</Text>

      {/* Loader */}
      <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#555'
  }
})