import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchCars, updateCars, Car } from '../../services/jsonbinService';
import { carDatabase, availableBrands, generateYearList } from '../carDatabase';

interface FormData {
  name: string;
  brand: string;
  model: string;
  year: string;
  km: string;
  price: string;
  imageUrl: string;
}

const resetFormData = (): FormData => ({
  name: '',
  brand: '',
  model: '',
  year: '',
  km: '',
  price: '',
  imageUrl: '',
});

export default function AddCarScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const [formData, setFormData] = useState<FormData>(resetFormData());
  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [, setCurrentYearRange] = useState({ start: 2000, end: 2026 });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBrandSelect = (brand: string) => {
    setFormData(prev => ({ ...prev, brand, name: '', model: '', year: '' }));
    const names = Object.keys(carDatabase[brand] || {});
    setAvailableNames(names);
    setAvailableVersions([]);
    setAvailableYears([]);
    setBrandModalVisible(false);
  };

  const handleNameSelect = (name: string) => {
    const modelInfo = carDatabase[formData.brand]?.[name];
    if (modelInfo) {
      setCurrentYearRange({ start: modelInfo.yearStart, end: modelInfo.yearEnd });
      const years = generateYearList(modelInfo.yearStart, modelInfo.yearEnd);
      setAvailableYears(years);
      setFormData(prev => ({ ...prev, name, model: '', year: years[0] || '' }));
      setAvailableVersions(modelInfo.versions);
    }
    setNameModalVisible(false);
  };

  const handleVersionSelect = (version: string) => {
    setFormData(prev => ({ ...prev, model: version }));
    setVersionModalVisible(false);
  };

  const handleYearSelect = (year: string) => {
    setFormData(prev => ({ ...prev, year }));
    setYearModalVisible(false);
  };

  const validateForm = () => {
    if (!formData.brand.trim()) { Alert.alert('Erro', 'Marca é obrigatória'); return false; }
    if (!formData.name.trim()) { Alert.alert('Erro', 'Nome do veículo é obrigatório'); return false; }
    if (!formData.model.trim()) { Alert.alert('Erro', 'Versão/Modelo é obrigatório'); return false; }
    if (!formData.year.trim() || isNaN(Number(formData.year))) { Alert.alert('Erro', 'Ano inválido'); return false; }
    if (!formData.km.trim() || isNaN(Number(formData.km))) { Alert.alert('Erro', 'Quilometragem inválida'); return false; }
    if (!formData.price.trim() || isNaN(Number(formData.price))) { Alert.alert('Erro', 'Preço inválido'); return false; }
    if (!formData.imageUrl.trim()) { Alert.alert('Erro', 'URL da imagem é obrigatória'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const newCar: Car = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        km: parseInt(formData.km),
        price: parseInt(formData.price),
        image: formData.imageUrl.trim(),
        createdAt: new Date().toISOString(),
      };

      const currentCars = await fetchCars();
      const updatedCars = [...currentCars, newCar];
      await updateCars(updatedCars);

      setFormData(resetFormData());
      setSuccessMessage('✓ Veículo adicionado com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
        router.replace('/(tabs)/products');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao adicionar veículo:', error);
      Alert.alert('Erro', `Não foi possível adicionar o veículo.\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adicionar Veículo</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {successMessage !== '' && (
          <View style={styles.successBanner}>
            <Feather name="check-circle" size={20} color="#2e7d32" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          {/* Marca */}
          <Text style={styles.label}>Marca</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setBrandModalVisible(true)}>
            <Text style={[styles.selectorText, !formData.brand && styles.selectorPlaceholder]}>
              {formData.brand || 'Selecione uma marca'}
            </Text>
            <Feather name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>

          {/* Nome do Veículo */}
          <Text style={styles.label}>Nome do Veículo</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.brand && styles.selectorDisabled]}
            onPress={() => formData.brand && setNameModalVisible(true)}
            disabled={!formData.brand}
          >
            <Text style={[styles.selectorText, !formData.name && styles.selectorPlaceholder, !formData.brand && styles.selectorDisabledText]}>
              {formData.name || (formData.brand ? 'Selecione o modelo' : 'Primeiro selecione a marca')}
            </Text>
            {formData.brand && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          {/* Versão ou Modelo */}
          <Text style={styles.label}>Versão ou Modelo</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.name && styles.selectorDisabled]}
            onPress={() => formData.name && setVersionModalVisible(true)}
            disabled={!formData.name}
          >
            <Text style={[styles.selectorText, !formData.model && styles.selectorPlaceholder, !formData.name && styles.selectorDisabledText]}>
              {formData.model || (formData.name ? 'Selecione a versão' : 'Primeiro selecione o modelo')}
            </Text>
            {formData.name && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          {/* Ano */}
          <Text style={styles.label}>Ano</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.name && styles.selectorDisabled]}
            onPress={() => formData.name && setYearModalVisible(true)}
            disabled={!formData.name}
          >
            <Text style={[styles.selectorText, !formData.year && styles.selectorPlaceholder, !formData.name && styles.selectorDisabledText]}>
              {formData.year || (formData.name ? 'Selecione o ano' : 'Primeiro selecione o modelo')}
            </Text>
            {formData.name && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          {/* Quilometragem */}
          <Text style={styles.label}>Quilometragem (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 45000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.km}
            onChangeText={(text) => handleChange('km', text)}
          />

          {/* Preço */}
          <Text style={styles.label}>Preço (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 35000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
          />

          {/* URL da Imagem */}
          <Text style={styles.label}>URL da Imagem</Text>
          <TextInput
            style={styles.input}
            placeholder="https://exemplo.com/foto.jpg"
            placeholderTextColor="#999"
            value={formData.imageUrl}
            onChangeText={(text) => handleChange('imageUrl', text)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Adicionar Veículo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Marca */}
      <Modal visible={brandModalVisible} transparent animationType="slide" onRequestClose={() => setBrandModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Marca</Text>
              <TouchableOpacity onPress={() => setBrandModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableBrands}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleBrandSelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.brand === item && <Feather name="check" size={20} color="#d32f2f" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Nome */}
      <Modal visible={nameModalVisible} transparent animationType="slide" onRequestClose={() => setNameModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Modelo</Text>
              <TouchableOpacity onPress={() => setNameModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableNames}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleNameSelect(item)}>
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemText}>{item}</Text>
                    <Text style={styles.yearRangeText}>
                      {`${carDatabase[formData.brand]?.[item]?.yearStart} - ${carDatabase[formData.brand]?.[item]?.yearEnd}`}
                    </Text>
                  </View>
                  {formData.name === item && <Feather name="check" size={20} color="#d32f2f" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Versão */}
      <Modal visible={versionModalVisible} transparent animationType="slide" onRequestClose={() => setVersionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Versão</Text>
              <TouchableOpacity onPress={() => setVersionModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableVersions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleVersionSelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.model === item && <Feather name="check" size={20} color="#d32f2f" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal Ano */}
      <Modal visible={yearModalVisible} transparent animationType="slide" onRequestClose={() => setYearModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Ano</Text>
              <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableYears}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleYearSelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.year === item && <Feather name="check" size={20} color="#d32f2f" />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
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
  },
  selectorDisabled: {
    backgroundColor: '#f0f0f0',
    opacity: 0.7,
  },
  selectorDisabledText: {
    color: '#999',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectorPlaceholder: {
    color: '#999',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 8,
  },
  imagePickerButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  yearRangeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
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
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    gap: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});