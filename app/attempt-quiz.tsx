import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function AttemptQuiz() {
  const { quizId } = useLocalSearchParams()

  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(60)

  // 🔥 FETCH QUESTIONS
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setQuestions(data)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  // 🔥 TIMER
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 0) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 🔥 STORE ANSWERS
  const handleSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
  }

  // 🔥 SUBMIT QUIZ
  const handleSubmit = () => {
    let score = 0

    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        score++
      }
    })

    Alert.alert('Result', `Score: ${score}/${questions.length}`)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.timer}>Time Left: {timeLeft}s</Text>

      {questions.map((q, index) => (
        <View key={q.id} style={styles.card}>
          <Text style={styles.question}>
            {index + 1}. {q.question}
          </Text>

          {['A', 'B', 'C', 'D'].map((opt) => {
            const isSelected = answers[q.id] === opt

            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.option,
                  isSelected && { backgroundColor: '#cce5ff' }
                ]}
                onPress={() => handleSelect(q.id, opt)}
              >
                <Text>
                  {opt}. {q[`option_${opt.toLowerCase()}`]}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Quiz</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10
  },
  question: {
    fontWeight: 'bold',
    marginBottom: 10
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    borderRadius: 6
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 40
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})