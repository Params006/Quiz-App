import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useState } from 'react'
import { supabase } from '../supabase'
import { useRouter } from 'expo-router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('teacher')
  const router = useRouter()

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      Alert.alert('Error', error.message)
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
      return
    }

    Alert.alert('Success', 'Account created! Please login.')
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      router.replace('/dashboard')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login / Signup</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#34C759' }]} onPress={handleSignup}>
        <Text style={styles.buttonText}>Signup</Text>
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