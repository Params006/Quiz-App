import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function CreateSubject() {
  const [name, setName] = useState('')
  const router = useRouter()

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8)
  }

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter subject name')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    // ✅ FIX: prevent null crash
    if (!user) {
      Alert.alert('Error', 'User not logged in. Please login again.')
      return
    }

    const { error } = await supabase.from('subjects').insert([
      {
        name,
        teacher_id: user.id,
        join_code: generateCode()
      }
    ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Subject created successfully')
      setName('')
      router.replace('/teacher-dashboard')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Subject</Text>

      <TextInput
        placeholder="Enter Subject Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create Subject</Text>
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
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})