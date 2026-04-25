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

  // 🔥 Dynamic color
  const getColor = () => {
    if (percentage >= 70) return '#22C55E' // green
    if (percentage >= 40) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        
        <Text style={styles.title}>🎉 Quiz Result</Text>

        {/* SCORE */}
        <Text style={[styles.score, { color: getColor() }]}>
          {finalScore} / {totalQuestions}
        </Text>

        {/* PERCENTAGE */}
        <Text style={styles.percentage}>
          {percentage}%
        </Text>

        {/* MESSAGE */}
        <Text style={styles.message}>
          {getMessage()}
        </Text>

        {/* BUTTONS */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/dashboard')}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },

  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20
  },

  score: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 5
  },

  percentage: {
    fontSize: 20,
    color: '#6B7280',
    marginBottom: 10
  },

  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 25,
    textAlign: 'center'
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },

  secondaryButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
})