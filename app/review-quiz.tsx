import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Answers</Text>

      <ScrollView>
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
              <Text style={styles.qText}>Question {index + 1}</Text>
              <Text>
                {isAnswered ? 'Answered ✅' : 'Not Answered ❌'}
              </Text>
            </View>
          )
        })}
      </ScrollView>

      <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
        <Text style={styles.submitText}>Submit Final 🚀</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#eef2ff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  questionBox: { padding: 15, borderRadius: 10, marginBottom: 10 },
  answered: { backgroundColor: '#d1fae5' },
  notAnswered: { backgroundColor: '#fee2e2' },
  qText: { fontWeight: 'bold' },
  submitButton: { marginTop: 20, backgroundColor: '#4f46e5', padding: 15, borderRadius: 12, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' }
})