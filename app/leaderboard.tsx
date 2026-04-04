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
        <Text>No leaderboard data yet</Text>
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

              <View>
                <Text style={styles.email}>
                  {item.users?.email || 'User'}
                </Text>
                <Text style={styles.score}>
                  Score: {item.score}
                </Text>
              </View>
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
    backgroundColor: '#eef2ff'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3
  },
  highlight: {
    backgroundColor: '#c7d2fe'
  },
  rank: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 15
  },
  email: {
    fontSize: 16,
    fontWeight: '600'
  },
  score: {
    fontSize: 14,
    color: '#555'
  }
})