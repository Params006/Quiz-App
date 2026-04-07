import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
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
      <Text style={styles.title}>Quiz IT</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Challenge your mind and level up with every quiz.</Text>

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