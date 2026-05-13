import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';
import { getDatabase, ref, push } from 'firebase/database';

export default function ManageNotificationsScreen() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert('Acesso negado', 'Apenas administradores podem acessar.');
      router.replace('/(tabs)/management');
    }
  }, [isAdmin, adminLoading]);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Erro', 'Preencha o título e a mensagem do aviso.');
      return;
    }

    setSending(true);
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, 'notifications');
      await push(notificationsRef, {
        title: title.trim(),
        message: message.trim(),
        createdAt: Date.now(),
        status: 'pending',
      });
      Alert.alert('Sucesso', 'Aviso enviado! Os e-mails começarão a ser enviados em breve.');
      setTitle('');
      setMessage('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o aviso.');
    } finally {
      setSending(false);
    }
  };

  if (adminLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#d32f2f" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar aviso por e-mail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Novo aviso</Text>
          <TextInput
            style={styles.input}
            placeholder="Título do aviso (ex: Promoção de fim de ano)"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mensagem do aviso..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity
            style={[styles.submitButton, sending && styles.buttonDisabled]}
            onPress={handleSendNotification}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Enviar aviso</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.helperText}>
            O aviso será enviado para todos os usuários cadastrados (e-mail cadastrado no login).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#d32f2f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, padding: 20 },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
    color: '#333',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
  helperText: { fontSize: 12, color: '#666', marginTop: 12, textAlign: 'center' },
});