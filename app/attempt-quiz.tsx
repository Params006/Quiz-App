import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function AttemptQuiz() {
  const { quizId } = useLocalSearchParams()
  const router = useRouter()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)

  // 🔥 Check if already attempted
  const checkAttempt = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)

    if (data && data.length > 0) {
      Alert.alert('Already Attempted', 'You have already attempted this quiz')
      router.replace('/dashboard')
    }
  }

  // 🔥 Fetch questions
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

    setLoading(false)
  }

  useEffect(() => {
    checkAttempt()
    fetchQuestions()
  }, [])

  // 🔥 Handle next question
  const handleNext = () => {
    if (!selectedAnswer) {
      Alert.alert('Select an option')
      return
    }

    const currentQuestion = questions[currentIndex]

    let updatedScore = score

    if (selectedAnswer === currentQuestion.correct_answer) {
      updatedScore = score + 1
      setScore(updatedScore)
    }

    setSelectedAnswer(null)

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      submitQuiz(updatedScore)
    }
  }

  // 🔥 Submit quiz (UPDATED NAVIGATION)
  const submitQuiz = async (finalScore) => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('results').insert([
      {
        user_id: user.id,
        quiz_id: quizId,
        score: finalScore
      }
    ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      // ✅ FINAL NAVIGATION FIX
      router.replace({
        pathname: '/result',
        params: {
          score: finalScore,
          total: questions.length,
          quizId: quizId   // 🔥 IMPORTANT
        }
      })
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Questions Found</Text>
      </View>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <View style={styles.container}>
      <Text style={styles.questionCount}>
        Question {currentIndex + 1} / {questions.length}
      </Text>

      <Text style={styles.question}>
        {currentQuestion.question}
      </Text>

      {/* 🔥 Options */}
      {['option_a', 'option_b', 'option_c', 'option_d'].map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.option,
            selectedAnswer === currentQuestion[opt] && styles.selected
          ]}
          onPress={() => setSelectedAnswer(currentQuestion[opt])}
        >
          <Text>{currentQuestion[opt]}</Text>
        </TouchableOpacity>
      ))}

      {/* 🔥 Next / Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex + 1 === questions.length ? 'Submit' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  questionCount: {
    fontSize: 16,
    marginBottom: 10
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  option: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  selected: {
    backgroundColor: '#d0ebff',
    borderColor: '#007AFF'
  },
  button: {
    marginTop: 20,
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