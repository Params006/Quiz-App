import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('teacher')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      Alert.alert('Error', error.message)
      setLoading(false)
      return
    }

    // ⚠️ Check if user exists
    if (!data?.user) {
      Alert.alert('Error', 'Signup failed. Try again.')
      setLoading(false)
      return
    }

    // 🔥 Insert into users table
    const { error: userError } = await supabase.from('users').insert([
      {
        id: data.user.id,
        role: selectedRole
      }
    ])

    if (userError) {
      Alert.alert('Error', userError.message)
      setLoading(false)
      return
    }

    // Auto-login after signup
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      Alert.alert('Error', loginError.message)
      setLoading(false)
      return
    }

    // Redirect based on role
    if (selectedRole === 'teacher') {
      router.replace('/dashboard')
    } else {
      router.replace('/join-subject')
    }

    setLoading(false)
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Alert.alert('Error', error.message)
      setLoading(false)
      return
    }

    // Fetch user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userError) {
      Alert.alert('Error', 'Failed to fetch user role')
      setLoading(false)
      return
    }

    // Redirect based on role
    if (userData.role === 'teacher') {
      router.replace('/dashboard')
    } else {
      router.replace('/join-subject')
    }

    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login / Signup</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      {/* 🔥 Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity 
          style={[styles.roleButton, selectedRole === 'teacher' && styles.selected]}
          onPress={() => setSelectedRole('teacher')}
        >
          <Text>Teacher</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.roleButton, selectedRole === 'student' && styles.selected]}
          onPress={() => setSelectedRole('student')}
        >
          <Text>Student</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#34C759' }]} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Signup'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  roleButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8
  },
  selected: {
    backgroundColor: '#ddd'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
})