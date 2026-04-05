import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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

    // Check role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'student') {
      router.replace('/teacher-dashboard')
      return
    }

    // Check enrollment
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

    // Fetch quizzes with question count
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

    // Filter quizzes with at least 1 question and check attempts
    const availableQuizzes = []
    for (const quiz of quizData || []) {
      const questionCount = quiz.questions?.[0]?.count || 0
      if (questionCount === 0) continue

      // Check if already attempted
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
    router.push({ pathname: '/attempt-quiz', params: { quizId } })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Quizzes</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/student-dashboard')}>
        <Text style={styles.backButtonText}>← Back to Subjects</Text>
      </TouchableOpacity>

      {loading ? (
        <Text>Loading...</Text>
      ) : quizzes.length === 0 ? (
        <Text style={styles.emptyText}>No quizzes available for this subject.</Text>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.quizInfo}>Duration: {item.duration} minutes</Text>
              {item.alreadyAttempted ? (
                <Text style={styles.attemptedText}>Already Attempted</Text>
              ) : (
                <TouchableOpacity
                  style={styles.attemptButton}
                  onPress={() => handleAttempt(item.id)}
                >
                  <Text style={styles.attemptButtonText}>Attempt Quiz</Text>
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
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20
  },
  backButton: {
    marginBottom: 20
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3
  },
  quizTitle: {
    fontWeight: 'bold',
    fontSize: 16
  },
  quizInfo: {
    color: '#666',
    marginTop: 5
  },
  attemptedText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    marginTop: 10
  },
  attemptButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  attemptButtonText: {
    color: '#fff',
    fontWeight: '600'
  }
})