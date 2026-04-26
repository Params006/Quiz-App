import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { supabase } from '../supabase'

export default function Questions() {
  const { quizId } = useLocalSearchParams()
  const router = useRouter()
  const [questions, setQuestions] = useState<any[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correct, setCorrect] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Fetch quiz to get subject_id
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('subject_id')
      .eq('id', quizId)
      .single()

    if (quizError) {
      Alert.alert('Error', 'Failed to load quiz')
      return
    }

    setSubjectId(quizData.subject_id)

    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('id', { ascending: true })

    if (questionsError) {
      Alert.alert('Error', questionsError.message)
    } else {
      setQuestions(questionsData || [])
    }

    setLoading(false)
  }

  const handleAddQuestion = async () => {
    if (!question || !optionA || !optionB || !optionC || !optionD || !correct) {
      Alert.alert('Error', 'Fill all fields')
      return
    }

    const { error } = await supabase.from('questions').insert([
      {
        quiz_id: quizId,
        question: question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correct
      }
    ])

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Question added!')

      // Clear fields
      setQuestion('')
      setOptionA('')
      setOptionB('')
      setOptionC('')
      setOptionD('')
      setCorrect('')
      setModalVisible(false)
      loadData() // Refresh list
    }
  }

  const renderQuestion = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.questionCard}>
      <Text style={styles.questionNumber}>Q{index + 1}:</Text>
      <Text style={styles.questionText}>{item.question}</Text>
      <Text style={styles.option}>A: {item.option_a}</Text>
      <Text style={styles.option}>B: {item.option_b}</Text>
      <Text style={styles.option}>C: {item.option_c}</Text>
      <Text style={styles.option}>D: {item.option_d}</Text>
      <Text style={styles.correct}>Correct: {item.correct_answer}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questions</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderQuestion}
          ListEmptyComponent={<Text style={styles.emptyText}>No questions added yet.</Text>}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Add New Question</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.doneButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Question</Text>

            <TextInput
              placeholder="Question"
              style={styles.input}
              value={question}
              onChangeText={setQuestion}
              multiline
            />
            <TextInput placeholder="Option A" style={styles.input} value={optionA} onChangeText={setOptionA} />
            <TextInput placeholder="Option B" style={styles.input} value={optionB} onChangeText={setOptionB} />
            <TextInput placeholder="Option C" style={styles.input} value={optionC} onChangeText={setOptionC} />
            <TextInput placeholder="Option D" style={styles.input} value={optionD} onChangeText={setOptionD} />
            <TextInput
              placeholder="Correct Answer"
              style={styles.input}
              value={correct}
              onChangeText={setCorrect}
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddQuestion}>
                <Text style={styles.buttonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  questionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3
  },
  questionNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  questionText: {
    fontSize: 16,
    marginBottom: 10
  },
  option: {
    fontSize: 14,
    marginBottom: 2
  },
  correct: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 5
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20
  },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  doneButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  doneButtonText: {
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
    width: '90%',
    maxHeight: '80%'
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
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  modalButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})