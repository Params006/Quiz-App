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

export default function JoinSubject() {
  const [code, setCode] = useState('')
  const router = useRouter()

  const handleJoin = async () => {
    if (!code) {
      Alert.alert('Error', 'Please enter join code')
      return
    }

    const user = (await supabase.auth.getUser()).data.user

    if (!user) {
      Alert.alert('Error', 'User not logged in')
      return
    }

    const { data: subject, error: fetchError } = await supabase
      .from('subjects')
      .select('*')
      .eq('join_code', code)
      .single()

    if (fetchError || !subject) {
      Alert.alert('Error', 'Invalid join code')
      return
    }

    const { error } = await supabase.from('enrollments').insert([
      {
        student_id: user.id,
        subject_id: subject.id
      }
    ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Joined successfully')
      setCode('')
      router.replace('/student-dashboard')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Subject</Text>

      <View style={styles.card}>

        <Text style={styles.label}>Join Code</Text>
        <TextInput
          placeholder="Enter Join Code"
          style={styles.input}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={handleJoin}>
          <Text style={styles.buttonText}>Join Subject</Text>
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