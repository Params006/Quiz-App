import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { supabase } from '../supabase'

export default function Leaderboard() {
  const { quizId } = useLocalSearchParams()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)

  const fetchLeaderboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    const { data, error } = await supabase
      .from('results')
      .select(`
        score,
        user_id,
        users ( email )
      `)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setData(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No leaderboard data yet</Text>
      </View>
    )
  }

  const getRankIcon = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => {
          const isCurrentUser = item.user_id === currentUserId

          return (
            <View
              style={[
                styles.card,
                isCurrentUser && styles.highlight
              ]}
            >
              <Text style={styles.rank}>
                {getRankIcon(index)}
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.email}>
                  {item.users?.email || 'User'}
                </Text>

                <Text style={styles.score}>
                  Score: {item.score}
                </Text>
              </View>

              {/* 🔥 YOU TAG */}
              {isCurrentUser && (
                <Text style={styles.youTag}>YOU</Text>
              )}
            </View>
          )
        }}
      />
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827'
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    elevation: 3
  },

  highlight: {
    backgroundColor: '#E0E7FF',
    borderWidth: 1,
    borderColor: '#4F46E5'
  },

  rank: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 15
  },

  email: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },

  score: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3
  },

  youTag: {
    backgroundColor: '#4F46E5',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600'
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280'
  }
})