import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('teacher');
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSignup = async () => {

    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Enter correct email format');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (!data?.user) {
      Alert.alert('Error', 'Signup failed. Try again.');
      return;
    }

    const { error: userError } = await supabase.from('users').insert([
      {
        id: data.user.id,
        email,
        role: selectedRole
      }
    ]);

    if (userError) {
      Alert.alert('Error', userError.message);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      Alert.alert('Error', loginError.message);
      return;
    }

    if (selectedRole === 'teacher') {
      router.replace('/teacher-dashboard');
    } else {
      router.replace('/student-dashboard');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account ✨</Text>
      <Text style={styles.subtitle}>Signup to get started</Text>

      {/* EMAIL */}
      <TextInput
        placeholder="Enter your email"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* PASSWORD */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.showText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ROLE */}
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'teacher' && styles.selected
          ]}
          onPress={() => setSelectedRole('teacher')}
        >
          <Text style={selectedRole === 'teacher' ? styles.selectedText : styles.roleText}>
            Teacher
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'student' && styles.selected
          ]}
          onPress={() => setSelectedRole('student')}
        >
          <Text style={selectedRole === 'student' ? styles.selectedText : styles.roleText}>
            Student
          </Text>
        </TouchableOpacity>
      </View>

      {/* SIGNUP BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* LOGIN LINK */}
      <Text style={styles.link} onPress={() => router.replace('/login')}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827'
  },

  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 30,
    marginTop: 5
  },

  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#111827'
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 20
  },

  passwordInput: {
    flex: 1,
    height: 50,
    color: '#111827'
  },

  showText: {
    color: '#4F46E5',
    fontWeight: '600'
  },

  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },

  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5
  },

  selected: {
    backgroundColor: '#4F46E5'
  },

  roleText: {
    color: '#111827',
    fontWeight: '500'
  },

  selectedText: {
    color: '#fff',
    fontWeight: '600'
  },

  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 10,
    elevation: 3
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  link: {
    marginTop: 20,
    color: '#4F46E5',
    textAlign: 'center',
    fontWeight: '500'
  },
});