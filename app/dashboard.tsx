import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const router = useRouter()
  const [subjects, setSubjects] = useState([])
  const [role, setRole] = useState('')

  useEffect(() => {
    fetchData()

    const interval = setInterval(() => {
      fetchData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 🔥 Get role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    setRole(userData?.role)

    // 🔹 Created subjects
    const { data: createdSubjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('teacher_id', user.id)

    // 🔹 Joined subjects
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('subject_id')

    let joinedSubjects = []

    if (enrollments) {
      const ids = enrollments.map(e => e.subject_id)

      const { data } = await supabase
        .from('subjects')
        .select('*')
        .in('id', ids)

      joinedSubjects = data || []
    }

    setSubjects([...(createdSubjects || []), ...joinedSubjects])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* 🔥 Role-based buttons */}
      {role === 'teacher' && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/create-subject')}
        >
          <Text style={styles.buttonText}>Create Subject</Text>
        </TouchableOpacity>
      )}

      {role === 'student' && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#34C759' }]}
          onPress={() => router.push('/join-subject')}
        >
          <Text style={styles.buttonText}>Join Subject</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.subtitle}>Your Subjects</Text>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subjectName}>{item.name}</Text>
            <Text style={styles.code}>Code: {item.join_code}</Text>
          </View>
        )}
      />

      {/* 🔥 Logout */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#FF3B30' }]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 20, marginVertical: 10 },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  subjectName: { fontWeight: 'bold' },
  code: { color: '#666' }
})