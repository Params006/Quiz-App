import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function AddQuestions() {
  const { quizId } = useLocalSearchParams()
  const router = useRouter()

  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correct, setCorrect] = useState('')

  const handleAddQuestion = async () => {
    if (!question || !optionA || !optionB || !optionC || !optionD || !correct) {
      Alert.alert('Error', 'Fill all fields')
      return
    }

    const { error } = await supabase.from('questions').insert([
      {
        quiz_id: quizId,
        question: question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correct
      }
    ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Question added!')

      // Clear fields
      setQuestion('')
      setOptionA('')
      setOptionB('')
      setOptionC('')
      setOptionD('')
      setCorrect('')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Question</Text>

      <TextInput placeholder="Question" style={styles.input} value={question} onChangeText={setQuestion} />
      <TextInput placeholder="Option A" style={styles.input} value={optionA} onChangeText={setOptionA} />
      <TextInput placeholder="Option B" style={styles.input} value={optionB} onChangeText={setOptionB} />
      <TextInput placeholder="Option C" style={styles.input} value={optionC} onChangeText={setOptionC} />
      <TextInput placeholder="Option D" style={styles.input} value={optionD} onChangeText={setOptionD} />
      <TextInput placeholder="Correct Answer (A/B/C/D)" style={styles.input} value={correct} onChangeText={setCorrect} />

      <TouchableOpacity style={styles.button} onPress={handleAddQuestion}>
        <Text style={styles.buttonText}>Add Question</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#34C759' }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
})