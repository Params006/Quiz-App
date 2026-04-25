import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
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
      loadQuizzes()
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzes</Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.primaryButtonText}>+ Create New Quiz</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : quizzes.length === 0 ? (
        <Text style={styles.emptyText}>No quizzes created yet.</Text>
      ) : (
        <FlatList
          data={quizzes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.quizTitle}>{item.title}</Text>
              <Text style={styles.quizInfo}>
                ⏱ Duration: {item.duration} min
              </Text>

              <TouchableOpacity
                style={styles.successButton}
                onPress={() =>
                  router.push({
                    pathname: '/questions',
                    params: { quizId: item.id }
                  })
                }
              >
                <Text style={styles.buttonText}>Manage Questions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() =>
                  router.push({
                    pathname: '/leaderboard',
                    params: { quizId: item.id }
                  })
                }
              >
                <Text style={styles.buttonText}>View Leaderboard</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* MODAL */}
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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: '#000' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCreateQuiz}
              >
                <Text style={styles.primaryButtonText}>Create</Text>
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
    backgroundColor: '#EEF2FF'
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#111'
  },

  loadingText: {
    textAlign: 'center',
    color: '#666'
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
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
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },

  successButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center'
  },

  secondaryButton: {
    backgroundColor: '#0bf5d6',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '85%'
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },

  input: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#000'
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center'
  }
})