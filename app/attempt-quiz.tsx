import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert, AppState, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../supabase'

export default function AttemptQuiz() {
  const { quizId } = useLocalSearchParams()
  const router = useRouter()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})

  const [appState, setAppState] = useState(AppState.currentState)
  const [violations, setViolations] = useState(0)

  // ⏱️ GLOBAL TIMER
  const [totalTimeLeft, setTotalTimeLeft] = useState(120)
  const [timer, setTimer] = useState(null)
  const [alreadyAttempted, setAlreadyAttempted] = useState(false)

  // 🔥 Check attempt
  const checkAttempt = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)

    if (data && data.length > 0) {
      setAlreadyAttempted(true)
      Alert.alert('Already Attempted', 'You have already attempted this quiz')
      router.replace('/dashboard')
      return true
    }
    return false
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

  // 🔥 Mark as attempted
  const markAttempted = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('results')
      .insert([
        {
          user_id: user.id,
          quiz_id: quizId,
          total: questions.length
        }
      ])

    if (error && error.code !== '23505') { // ignore duplicate key error
      console.error('Error marking attempt:', error)
    }
  }

  // ⏱️ Start timer
  const startQuizTimer = () => {
    const newTimer = setInterval(() => {
      setTotalTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(newTimer)
          goToReview() // ✅ go to review instead of submit
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setTimer(newTimer)
  }

  useEffect(() => {
    const init = async () => {
      const attempted = await checkAttempt()
      if (!attempted) {
        await fetchQuestions()
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!alreadyAttempted && questions.length > 0) {
      markAttempted()
    }
  }, [questions, alreadyAttempted])

  useEffect(() => {
    if (questions.length > 0) {
      startQuizTimer()
    }
  }, [questions])

  useEffect(() => {
  const subscription = AppState.addEventListener('change', nextAppState => {

    if (appState === 'active' && nextAppState !== 'active') {

      // 🚨 User left app
      if (violations >= 2) {
        Alert.alert(
          'Auto Submit',
          'You switched apps multiple times. Submitting quiz.'
        )

        goToReview()
      } else {
        Alert.alert(
          'Warning',
          `Do not leave the quiz!\nAttempts left: ${2 - violations}`
        )

        setViolations(prev => prev + 1)
      }
    }

    setAppState(nextAppState)
  })

  return () => {
    subscription.remove()
  }
}, [appState, violations])

  // 👉 NEXT
  const handleNext = () => {
    const selectedAnswer = answers[currentIndex]

    if (!selectedAnswer) {
      Alert.alert('Select an option')
      return
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
    } else {
      goToReview() // ✅ go to review instead of submit
    }
  }

  // 👉 PREVIOUS
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // ✅ GO TO REVIEW
  const goToReview = () => {
    if (timer) clearInterval(timer)

    router.replace({
      pathname: '/review-quiz',
      params: {
        quizId,
        answers: JSON.stringify(answers),
        questions: JSON.stringify(questions)
      }
    })
  }

  // 🔥 Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  // 🔥 No questions
  if (questions.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No Questions Found</Text>
      </View>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex + 1) / questions.length

  return (
    <View style={styles.container}>

      {/* ⏱️ TIMER */}
      <Text style={styles.timer}>
        ⏱️ {Math.floor(totalTimeLeft / 60)}:
        {(totalTimeLeft % 60).toString().padStart(2, '0')}
      </Text>

      {/* 📊 PROGRESS */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <Text style={styles.progressText}>
        {Math.round(progress * 100)}% Completed
      </Text>

      <View style={styles.card}>
        <Text style={styles.questionCount}>
          Question {currentIndex + 1} / {questions.length}
        </Text>

        <Text style={styles.question}>
          {currentQuestion.question}
        </Text>

        {/* 🔥 OPTIONS */}
        {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, index) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.option,
              answers[currentIndex] === currentQuestion[opt] && styles.selected
            ]}
            onPress={() =>
              setAnswers({
                ...answers,
                [currentIndex]: currentQuestion[opt]
              })
            }
          >
            <Text style={styles.optionText}>
              {String.fromCharCode(65 + index)}. {currentQuestion[opt]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔥 BUTTONS */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, currentIndex === 0 && { opacity: 0.5 }]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={styles.buttonText}>⬅️ Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex + 1 === questions.length ? 'Review 🔍' : 'Next ➡️'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// 🎨 STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
    padding: 20,
    gap: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'right'
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5'
  },
  progressText: {
    textAlign: 'right',
    color: '#555',
    marginBottom: 10
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  questionCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  option: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  selected: {
    backgroundColor: '#4f46e5'
  },
  optionText: {
    fontSize: 16,
    color: '#000'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})