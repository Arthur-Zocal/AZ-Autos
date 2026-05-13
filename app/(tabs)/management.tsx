import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';

export default function ManagementScreen() {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      Alert.alert('Acesso negado', 'Apenas administradores podem acessar.');
      router.replace('/(tabs)/products');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#d32f2f" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administração</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/addCar')}>
          <Feather name="plus-circle" size={40} color="#d32f2f" />
          <Text style={styles.cardTitle}>Adicionar veículo</Text>
          <Text style={styles.cardDesc}>Cadastre um novo carro no catálogo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('/manageCoupons')}>
          <Feather name="tag" size={40} color="#d32f2f" />
          <Text style={styles.cardTitle}>Gerenciar cupons</Text>
          <Text style={styles.cardDesc}>Criar, editar ou remover cupons de desconto</Text>
        </TouchableOpacity>

        {/* NOVO CARD: Enviar aviso por e-mail */}
        <TouchableOpacity style={styles.card} onPress={() => router.push('../manageNotifications')}>
          <Feather name="bell" size={40} color="#d32f2f" />
          <Text style={styles.cardTitle}>Enviar aviso</Text>
          <Text style={styles.cardDesc}>Enviar notificação por e-mail para todos os usuários</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#d32f2f',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  cardDesc: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
});