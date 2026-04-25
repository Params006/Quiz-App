import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../supabase'

export default function ReviewQuiz() {
  const { answers, questions, quizId } = useLocalSearchParams()
  const router = useRouter()

  const parsedAnswers = JSON.parse(answers)
  const parsedQuestions = JSON.parse(questions)

  const submitQuiz = async () => {
    let finalScore = 0

    parsedQuestions.forEach((q, index) => {
      if (parsedAnswers[index] === q.correct_answer) {
        finalScore++
      }
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('results')
      .update({
        score: finalScore,
        total: parsedQuestions.length
      })
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      router.replace({
        pathname: '/result',
        params: {
          score: finalScore,
          total: parsedQuestions.length,
          quizId
        }
      })
    }
  }

  const answeredCount = Object.keys(parsedAnswers).length
  const totalQuestions = parsedQuestions.length

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Answers</Text>

      {/* 🔥 Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Answered: {answeredCount} / {totalQuestions}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {parsedQuestions.map((q, index) => {
          const isAnswered = parsedAnswers[index]

          return (
            <View
              key={index}
              style={[
                styles.questionBox,
                isAnswered ? styles.answered : styles.notAnswered
              ]}
            >
              <Text style={styles.qText}>
                Question {index + 1}
              </Text>

              <Text style={styles.statusText}>
                {isAnswered ? 'Answered ✅' : 'Not Answered ❌'}
              </Text>
            </View>
          )
        })}
      </ScrollView>

      {/* 🔥 Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitQuiz}
      >
        <Text style={styles.submitText}>
          Submit Final 🚀
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEF2FF'
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#111'
  },

  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3
  },

  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    textAlign: 'center'
  },

  questionBox: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 12
  },

  answered: {
    backgroundColor: '#DCFCE7'
  },

  notAnswered: {
    backgroundColor: '#FEE2E2'
  },

  qText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 5,
    color: '#111'
  },

  statusText: {
    fontSize: 14,
    color: '#444'
  },

  submitButton: {
    marginTop: 15,
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4
  },

  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
})