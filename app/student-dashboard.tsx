import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
      <Text style={styles.title}>Student Dashboard</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#34C759' }]}
        onPress={() => router.push('/join-subject')}
      >
        <Text style={styles.buttonText}>Join Subject</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Enrolled Subjects</Text>
      {subjects.length === 0 ? (
        <Text style={styles.emptyText}>You are not enrolled in any subjects yet.</Text>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.code}>Code: {item.join_code}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF3B30' }]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3
  },
  subjectName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  code: {
    color: '#666'
  },
  emptyText: {
    color: '#666',
    marginTop: 10
  }
})