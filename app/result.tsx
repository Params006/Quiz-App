import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function Result() {
  const { score, total, quizId } = useLocalSearchParams()
  const router = useRouter()

  // 🔥 Convert to number (VERY IMPORTANT)
  const finalScore = Number(score)
  const totalQuestions = Number(total)

  const percentage = Math.round((finalScore / totalQuestions) * 100)

  // 🔥 Performance message
  const getMessage = () => {
    if (percentage === 100) return 'Excellent 🎯'
    if (percentage >= 70) return 'Great Job 👍'
    if (percentage >= 40) return 'Good प्रयास 👍'
    return 'Keep Practicing 💪'
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Result</Text>

      {/* 🔥 Score */}
      <Text style={styles.score}>
        {finalScore} / {totalQuestions}
      </Text>

      {/* 🔥 Percentage */}
      <Text style={styles.percentage}>
        {percentage}%
      </Text>

      {/* 🔥 Message */}
      <Text style={styles.message}>
        {getMessage()}
      </Text>

      {/* 🔥 Go to Dashboard */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/dashboard')}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>

      {/* 🔥 View Leaderboard */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#34C759' }]}
        onPress={() =>
          router.push({
            pathname: '/leaderboard',
            params: { quizId }
          })
        }
      >
        <Text style={styles.buttonText}>View Leaderboard</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20
  },
  score: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10
  },
  percentage: {
    fontSize: 24,
    marginBottom: 10
  },
  message: {
    fontSize: 20,
    marginBottom: 30
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})