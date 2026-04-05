import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
    backgroundColor: '#34C759',
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