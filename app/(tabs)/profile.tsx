import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { database } from '../../services/connectionFirebase';
import { ref, onValue } from 'firebase/database';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      const unsubscribe = onValue(
        userRef,
        (snapshot) => {
          setUserData(snapshot.val());
          setLoading(false);
        },
        (_error) => {
          console.error('Erro ao carregar dados:');
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair');
    }
  };

  const getUserTypeText = () => {
    if (userData?.role === 'admin') {
      return 'Administrador';
    }
    return 'Usuário';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.value}>
            {`${userData?.firstName} ${userData?.lastName}`}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>{userData?.phone}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>UID:</Text>
          <Text style={styles.value}>{user?.uid}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={[styles.value, userData?.role === 'admin' && styles.adminText]}>
            {getUserTypeText()}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    maxWidth: 600, 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1, 
    textAlign: 'right',
    marginLeft: 10,
  },
  adminText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    width: '90%', 
    maxWidth: 600,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});