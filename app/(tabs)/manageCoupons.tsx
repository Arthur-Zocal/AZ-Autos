import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  FlatList, Alert, ActivityIndicator, Switch, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';
import { getAllCoupons, saveCoupon, deleteCoupon, Coupon } from '../../services/couponBinService';

export default function ManageCouponsScreen() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [coupons, setCoupons] = useState<Record<string, Coupon>>({});
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCode, setEditingCode] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'free_shipping',
    value: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    if (!isAdmin && !adminLoading) {
      Alert.alert('Acesso negado', 'Apenas administradores podem acessar.');
      router.back();
      return;
    }
    loadCoupons();
  }, [isAdmin, adminLoading]);

  const loadCoupons = async () => {
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os cupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const code = formData.code.trim().toUpperCase();
    if (!code) {
      Alert.alert('Erro', 'Informe o código do cupom.');
      return;
    }
    if (formData.type === 'percentage') {
      const value = parseFloat(formData.value);
      if (isNaN(value) || value <= 0 || value > 100) {
        Alert.alert('Erro', 'Valor percentual deve ser entre 1 e 100.');
        return;
      }
      await saveCoupon(code, {
        type: 'percentage',
        value,
        active: formData.active,
        description: formData.description,
      });
    } else {
      await saveCoupon(code, {
        type: 'free_shipping',
        value: 0,
        active: formData.active,
        description: formData.description,
      });
    }
    await loadCoupons();
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      active: true,
    });
    setEditingCode('');
  };

  const handleDelete = async (code: string) => {
    Alert.alert('Confirmar', `Remover cupom ${code}?`, [
      { text: 'Cancelar' },
      { text: 'Remover', onPress: async () => {
          await deleteCoupon(code);
          await loadCoupons();
        } },
    ]);
  };

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cupons</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={Object.entries(coupons)}
        keyExtractor={([code]) => code}
        renderItem={({ item: [code, coupon] }) => (
          <View style={styles.couponCard}>
            <View style={styles.couponInfo}>
              <Text style={styles.couponCode}>{code}</Text>
              <Text style={styles.couponDesc}>{coupon.description}</Text>
              <Text style={styles.couponType}>
                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : 'Frete Grátis'}
              </Text>
              <Text style={[styles.couponStatus, coupon.active ? styles.active : styles.inactive]}>
                {coupon.active ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(code)} style={styles.deleteButton}>
              <Feather name="trash-2" size={20} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum cupom cadastrado</Text>}
      />

      {/* Modal de criar/editar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo cupom</Text>
            <TextInput
              style={styles.input}
              placeholder="Código (ex: DESCONTO10)"
              value={formData.code}
              onChangeText={text => setFormData(prev => ({ ...prev, code: text }))}
              autoCapitalize="characters"
            />
            <View style={styles.switchRow}>
              <Text>Tipo percentual</Text>
              <Switch
                value={formData.type === 'percentage'}
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val ? 'percentage' : 'free_shipping' }))}
              />
            </View>
            {formData.type === 'percentage' && (
              <TextInput
                style={styles.input}
                placeholder="Percentual (ex: 10)"
                keyboardType="numeric"
                value={formData.value}
                onChangeText={text => setFormData(prev => ({ ...prev, value: text }))}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Descrição"
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
            />
            <View style={styles.switchRow}>
              <Text>Ativo</Text>
              <Switch
                value={formData.active}
                onValueChange={(val) => setFormData(prev => ({ ...prev, active: val }))}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); resetForm(); }}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={{ color: '#fff' }}>Salvar</Text>
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
    backgroundColor: '#d32f2f', paddingVertical: 20, paddingHorizontal: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  addButton: { padding: 4 },
  couponCard: {
    backgroundColor: '#fff', marginHorizontal: 20, marginVertical: 8,
    padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 3,
  },
  couponInfo: { flex: 1 },
  couponCode: { fontSize: 16, fontWeight: 'bold', color: '#d32f2f' },
  couponDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  couponType: { fontSize: 12, color: '#333', marginTop: 4 },
  couponStatus: { fontSize: 12, marginTop: 4 },
  active: { color: '#2e7d32' },
  inactive: { color: '#999' },
  deleteButton: { padding: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginRight: 8 },
  saveBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#d32f2f', borderRadius: 8, marginLeft: 8 },
});