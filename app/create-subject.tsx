import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
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

      <View style={styles.card}>

        <Text style={styles.label}>Subject Name</Text>
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    justifyContent: 'center'
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 20
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 4
  },

  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6
  },

  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827'
  },

  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
})