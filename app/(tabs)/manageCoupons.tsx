import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Switch, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';
import { fetchCoupons, saveCoupon, deleteCoupon, Coupon } from '../../services/couponService';

export default function ManageCouponsScreen() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<{ code: string; description: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      Alert.alert('Acesso negado', 'Apenas administradores podem acessar.');
      router.replace('/(tabs)/products');
    }
  }, [isAdmin, adminLoading, router]);

  const loadCoupons = async () => {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar cupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) loadCoupons(); }, [isAdmin]);

  const handleAddCoupon = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) { Alert.alert('Erro', 'Digite o código do cupom'); return; }
    const percent = parseFloat(newValue);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      Alert.alert('Erro', 'Percentual deve ser entre 1 e 100');
      return;
    }
    try {
      await saveCoupon(code, {
        type: 'percentage',
        value: percent,
        active: true,
        description: newDesc.trim() || `${percent}% de desconto`,
      });
      setNewCode('');
      setNewValue('');
      setNewDesc('');
      setSuccessMessage('✓ Cupom criado com sucesso!');
      await loadCoupons();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar o cupom');
    }
  };

  const confirmDelete = (code: string, description: string) => {
    setSelectedCoupon({ code, description });
    setDeleteModalVisible(true);
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;
    setDeleting(true);
    try {
      await deleteCoupon(selectedCoupon.code);
      await loadCoupons();
      Alert.alert('Sucesso!', 'Cupom removido com sucesso!');
      setDeleteModalVisible(false);
      setSelectedCoupon(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível remover o cupom.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (code: string, currentActive: boolean) => {
    const coupon = coupons[code];
    if (!coupon) return;
    const updatedCoupon = { ...coupon, active: !currentActive };
    await saveCoupon(code, updatedCoupon);
    await loadCoupons();
  };

  if (adminLoading) return <ActivityIndicator size="large" color="#d32f2f" style={{ flex: 1 }} />;
  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/management')} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerenciar cupons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {successMessage !== '' && (
          <View style={styles.successBanner}>
            <Feather name="check-circle" size={20} color="#2e7d32" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Card de criar cupom */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Criar novo cupom</Text>
          <TextInput
            style={styles.input}
            placeholder="Código (ex: DESCONTO10)"
            placeholderTextColor="#999"
            value={newCode}
            onChangeText={setNewCode}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder="Percentual de desconto (1 a 100)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={newValue}
            onChangeText={setNewValue}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição (ex: 10% de desconto)"
            placeholderTextColor="#999"
            value={newDesc}
            onChangeText={setNewDesc}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddCoupon}>
            <Text style={styles.submitButtonText}>Criar cupom</Text>
          </TouchableOpacity>
        </View>

        {/* Card de listagem de cupons */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Cupons existentes</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#d32f2f" />
          ) : Object.keys(coupons).length === 0 ? (
            <Text style={styles.emptyText}>Nenhum cupom cadastrado.</Text>
          ) : (
            Object.entries(coupons).map(([code, coup]) => (
              <View key={code} style={styles.couponRow}>
                <View style={styles.couponInfo}>
                  <Text style={styles.couponCode}>{code}</Text>
                  <Text style={styles.couponDesc}>{coup.description}</Text>
                  <Text style={styles.couponType}>
                    {coup.type === 'percentage' ? `${coup.value}% OFF` : 'Frete Grátis'}
                  </Text>
                </View>
                <View style={styles.rowActions}>
                  <Switch
                    value={coup.active}
                    onValueChange={() => handleToggleActive(code, coup.active)}
                    trackColor={{ false: '#767577', true: '#d32f2f' }}
                    thumbColor={coup.active ? '#fff' : '#f4f3f4'}
                  />
                  <TouchableOpacity onPress={() => confirmDelete(code, coup.description)} style={styles.deleteButton}>
                    <Feather name="trash-2" size={22} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de exclusão (mesmo estilo dos carros) */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Feather name="alert-triangle" size={40} color="#d32f2f" />
              <Text style={styles.deleteModalTitle}>Remover Cupom</Text>
            </View>
            <Text style={styles.deleteModalText}>
              {`Tem certeza que deseja remover o cupom "${selectedCoupon?.code}"?`}
            </Text>
            <Text style={styles.deleteModalWarning}>Esta ação não pode ser desfeita.</Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedCoupon(null);
                }}>
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, deleting && styles.buttonDisabled]}
                onPress={handleDeleteCoupon}
                disabled={deleting}>
                {deleting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Remover</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#d32f2f',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  selector: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  couponInfo: {
    flex: 1,
    paddingRight: 8,
  },
  couponCode: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  couponDesc: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  couponType: {
    fontSize: 12,
    marginTop: 2,
    color: '#d32f2f',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c8e6c9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteModalWarning: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelDeleteText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
  },
  confirmDeleteText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});