import { useLocalSearchParams, useRouter } from 'expo-router'
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

export default function CreateQuiz() {
  const router = useRouter()
  const { subjectId } = useLocalSearchParams()

  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')

  const handleCreateQuiz = async () => {
    if (!title || !duration) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      Alert.alert('Error', 'User not logged in')
      return
    }

    const { data, error } = await supabase
      .from('quizzes')
      .insert([
        {
          title: title,
          duration: parseInt(duration),
          subject_id: subjectId,
          created_by: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Quiz created!')

      router.push({
        pathname: '/questions',
        params: { quizId: data.id }
      })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Quiz</Text>

      <View style={styles.card}>

        <Text style={styles.label}>Quiz Title</Text>
        <TextInput
          placeholder="Enter Quiz Title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Duration (in minutes)</Text>
        <TextInput
          placeholder="Enter Duration"
          keyboardType="numeric"
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateQuiz}>
          <Text style={styles.buttonText}>Create Quiz</Text>
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
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827'
  },

  button: {
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
})