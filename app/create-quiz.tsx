import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

    // 🔥 Get logged in user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      Alert.alert('Error', 'User not logged in')
      return
    }

    // 🔥 Insert quiz
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

      // 🔥 Navigate to Add Questions screen
      router.push({
        pathname: '/add-questions',
        params: { quizId: data.id }
      })
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Quiz</Text>

      <TextInput
        placeholder="Enter Quiz Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="Enter Duration (minutes)"
        keyboardType="numeric"
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateQuiz}>
        <Text style={styles.buttonText}>Create Quiz</Text>
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
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})