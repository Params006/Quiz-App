import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../supabase'

export default function StudentSubjectQuizzes() {
  const { subjectId } = useLocalSearchParams()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'student') {
      router.replace('/teacher-dashboard')
      return
    }

    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('subject_id', subjectId)
      .single()

    if (enrollError || !enrollment) {
      Alert.alert('Access Denied', 'You are not enrolled in this subject')
      router.replace('/student-dashboard')
      return
    }

    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        duration,
        created_at,
        questions:questions(count)
      `)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })

    if (quizError) {
      Alert.alert('Error', quizError.message)
      setLoading(false)
      return
    }

    const availableQuizzes = []
    for (const quiz of quizData || []) {
      const questionCount = quiz.questions?.[0]?.count || 0
      if (questionCount === 0) continue

      const { data: attempt } = await supabase
        .from('results')
        .select('id')
        .eq('user_id', user.id)
        .eq('quiz_id', quiz.id)
        .single()

      availableQuizzes.push({
        ...quiz,
        alreadyAttempted: !!attempt
      })
    }

    setQuizzes(availableQuizzes)
    setLoading(false)
  }

  const handleAttempt = (quizId: string) => {
    router.replace({ pathname: '/attempt-quiz', params: { quizId } })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Quizzes</Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/student-dashboard')}
      >
        <Text style={styles.backButtonText}>← Back to Subjects</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : quizzes.length === 0 ? (
        <Text style={styles.emptyText}>
          No quizzes available for this subject.
        </Text>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.quizTitle}>{item.title}</Text>

              <Text style={styles.quizInfo}>
                ⏱ {item.duration} minutes
              </Text>

              {item.alreadyAttempted ? (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() =>
                    router.push({
                      pathname: '/leaderboard',
                      params: { quizId: item.id }
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    View Leaderboard
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleAttempt(item.id)}
                >
                  <Text style={styles.buttonText}>
                    Start Quiz 🚀
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111'
  },

  backButton: {
    marginBottom: 20
  },

  backButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '500'
  },

  loadingText: {
    textAlign: 'center',
    color: '#666'
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#6B7280'
  },

  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 4
  },

  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111'
  },

  quizInfo: {
    color: '#6B7280',
    marginTop: 5
  },

  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center'
  },

  secondaryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
})