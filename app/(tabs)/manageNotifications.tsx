import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';
import { database } from '../../services/connectionFirebase';
import { ref, push, onValue, update, remove } from 'firebase/database';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: number;
}

export default function ManageNotificationsScreen() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();

  // Estados do formulário de envio
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Estados da listagem
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // Modais de edição e exclusão
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Verificação de admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert('Acesso negado', 'Apenas administradores podem acessar.');
      router.replace('/(tabs)/management');
    }
  }, [isAdmin, adminLoading, router]);

  // Carregar lista de avisos em tempo real
  useEffect(() => {
    if (!isAdmin) return;
    const notifRef = ref(database, 'notifications');
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const data = snapshot.val();
      const list: NotificationItem[] = [];
      if (data) {
        Object.entries(data).forEach(([key, value]: any) => {
          list.push({
            id: key,
            title: value.title || 'Sem título',
            message: value.message || '',
            createdAt: value.createdAt || 0,
          });
        });
        list.sort((a, b) => b.createdAt - a.createdAt);
      }
      setNotifications(list);
      setListLoading(false);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  // Envio de nova notificação
  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Erro', 'Preencha o título e a mensagem do aviso.');
      return;
    }
    setSending(true);
    try {
      const notificationsRef = ref(database, 'notifications');
      await push(notificationsRef, {
        title: title.trim(),
        message: message.trim(),
        createdAt: Date.now(),
        status: 'sent',
      });
      Alert.alert('Sucesso', 'Aviso enviado!');
      setTitle('');
      setMessage('');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível enviar o aviso.');
    } finally {
      setSending(false);
    }
  };

  // Edição
  const openEdit = (item: NotificationItem) => {
    setSelectedNotif(item);
    setEditTitle(item.title);
    setEditMessage(item.message);
    setEditModalVisible(true);
  };

  const handleEdit = async () => {
    if (!selectedNotif) return;
    if (!editTitle.trim() || !editMessage.trim()) {
      Alert.alert('Erro', 'Preencha título e mensagem.');
      return;
    }
    setSavingEdit(true);
    try {
      const notifRef = ref(database, `notifications/${selectedNotif.id}`);
      await update(notifRef, {
        title: editTitle.trim(),
        message: editMessage.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('Sucesso', 'Aviso atualizado.');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Exclusão
  const confirmDelete = (item: NotificationItem) => {
    setSelectedNotif(item);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedNotif) return;
    try {
      const notifRef = ref(database, `notifications/${selectedNotif.id}`);
      await remove(notifRef);
      setDeleteModalVisible(false);
      setSelectedNotif(null);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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

  const renderItem = (item: NotificationItem) => (
    <View style={styles.card} key={item.id}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionButton}>
            <Feather name="edit-2" size={20} color="#d32f2f" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.actionButton}>
            <Feather name="trash-2" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      {item.createdAt ? (
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString('pt-BR')}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enviar e Gerenciar Avisos</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulário de envio */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Novo aviso</Text>
          <TextInput
            style={styles.input}
            placeholder="Título do aviso"
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
            O aviso será enviado para todos os usuários que permitiram notificações.
          </Text>
        </View>

        {/* Lista de avisos existentes */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Avisos enviados</Text>
          {listLoading ? (
            <ActivityIndicator size="small" color="#d32f2f" style={{ marginTop: 20 }} />
          ) : notifications.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="bell-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum aviso enviado.</Text>
            </View>
          ) : (
            notifications.map((item) => renderItem(item))
          )}
        </View>
      </ScrollView>

      {/* Modal de Edição */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar aviso</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={editTitle}
              onChangeText={setEditTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mensagem"
              multiline
              value={editMessage}
              onChangeText={setEditMessage}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, savingEdit && styles.buttonDisabled]}
                onPress={handleEdit}
                disabled={savingEdit}
              >
                {savingEdit ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Feather name="alert-triangle" size={40} color="#d32f2f" />
            <Text style={styles.deleteModalTitle}>Excluir aviso?</Text>
            <Text style={styles.deleteModalText}>
              {`Tem certeza que deseja excluir "${selectedNotif?.title}"?`}
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.confirmDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Título das seções (Novo aviso, Avisos enviados)
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
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
 
  cardItemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionButton: { padding: 4 },
  message: { fontSize: 14, color: '#666', marginBottom: 8 },
  date: { fontSize: 12, color: '#999' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#d32f2f', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 20 },
  cancelText: { color: '#666', fontSize: 16 },
  saveButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveText: { color: '#fff', fontWeight: '600' },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  deleteModalTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  deleteModalText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  deleteModalButtons: { flexDirection: 'row', gap: 15 },
  cancelDeleteButton: {
    paddingHorizontal: 16,
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 9,
    alignItems: 'center',
  },
  cancelDeleteText: { color: '#666', fontWeight: '600' },
  confirmDeleteButton: {
    paddingHorizontal: 16,
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#d32f2f',
    borderRadius: 9,
    alignItems: 'center',
  },
  confirmDeleteText: { color: '#fff', fontWeight: '600' },
});