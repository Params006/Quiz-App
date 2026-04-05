import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function SubjectQuizzes() {
  const router = useRouter()
  const { subjectId } = useLocalSearchParams()
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const handleCreateQuiz = async () => {
    if (!title || !duration) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      Alert.alert('Error', 'User not logged in')
      return
    }

    // Check for duplicate title in this subject
    const { data: existing } = await supabase
      .from('quizzes')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('created_by', user.id)
      .ilike('title', title.trim())

    if (existing && existing.length > 0) {
      Alert.alert('Error', 'A quiz with this name already exists in this subject')
      return
    }

    const { error } = await supabase
      .from('quizzes')
      .insert([
        {
          title: title.trim(),
          duration: parseInt(duration),
          subject_id: subjectId,
          created_by: user.id
        }
      ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Quiz created!')
      setTitle('')
      setDuration('')
      setModalVisible(false)
      loadQuizzes() // Refresh list
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzes</Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Create New Quiz</Text>
      </TouchableOpacity>

      {loading ? (
        <Text>Loading...</Text>
      ) : quizzes.length === 0 ? (
        <Text style={styles.emptyText}>No quizzes created yet.</Text>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.quizInfo}>Duration: {item.duration} minutes</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push({ pathname: '/questions', params: { quizId: item.id } })}
              >
                <Text style={styles.addButtonText}>Questions</Text>
              </TouchableOpacity>              <TouchableOpacity
                style={styles.leaderboardButton}
                onPress={() => router.push({ pathname: '/leaderboard', params: { quizId: item.id } })}
              >
                <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
              </TouchableOpacity>            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Quiz</Text>

            <TextInput
              placeholder="Quiz Title"
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              placeholder="Duration (minutes)"
              keyboardType="numeric"
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateQuiz}>
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
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
  addButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  leaderboardButton: {
    backgroundColor: '#FF9500',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  leaderboardButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  }
})