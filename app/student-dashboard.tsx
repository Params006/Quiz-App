import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../supabase'

export default function StudentDashboard() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
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

    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('subject_id')
      .eq('student_id', user.id)

    if (enrollmentError) {
      Alert.alert('Error', enrollmentError.message)
      setLoading(false)
      return
    }

    let joinedSubjects = []
    const ids = (enrollments || []).map((enrollment) => enrollment.subject_id)

    if (ids.length > 0) {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('id', ids)

      if (error) {
        Alert.alert('Error', error.message)
      } else {
        joinedSubjects = data || []
      }
    }

    setSubjects(joinedSubjects)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Student Dashboard</Text>

      {/* JOIN BUTTON */}
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => router.push('/join-subject')}
      >
        <Text style={styles.buttonText}>+ Join Subject</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Your Subjects</Text>

      {subjects.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No subjects joined yet</Text>
          <Text style={styles.emptySubText}>
            Tap "Join Subject" to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/student-subject-quizzes',
                  params: { subjectId: item.id }
                })
              }
            >
              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.code}>Code: {item.join_code}</Text>
              <Text style={styles.infoText}>View Quizzes →</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20
  },

  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10
  },

  joinButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2
  },

  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3
  },

  subjectName: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#111827'
  },

  code: {
    color: '#6B7280',
    marginTop: 4
  },

  infoText: {
    color: '#4F46E5',
    marginTop: 10,
    fontWeight: '500'
  },

  emptyBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20
  },

  emptyText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600'
  },

  emptySubText: {
    color: '#6B7280',
    marginTop: 5
  }
})