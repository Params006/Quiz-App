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

  const fetchLeaderboard = async () => {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>

      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>

            <View>
              <Text style={styles.email}>
                {item.users?.email || 'User'}
              </Text>
              <Text style={styles.score}>
                Score: {item.score}
              </Text>
            </View>
          </View>
        )}
      />
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
    borderRadius: 10,
    marginBottom: 10
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