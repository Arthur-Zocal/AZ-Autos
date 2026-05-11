import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchCars, updateCars} from '../../services/jsonbinService';
import { carDatabase, availableBrands, generateYearList } from '../carDatabase';

interface EditFormData {
  name: string;
  brand: string;
  model: string;
  year: string;
  km: string;
  price: string;
  imageUrl: string;
  currentImageUrl: string;
}

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    brand: '',
    model: '',
    year: '',
    km: '',
    price: '',
    imageUrl: '',
    currentImageUrl: '',
  });

  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [, setCurrentYearRange] = useState({ start: 2000, end: 2026 });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const loadCarData = async () => {
      if (!id) {
        Alert.alert('Erro', 'ID do veículo não encontrado');
        router.back();
        return;
      }
      try {
        const allCars = await fetchCars();
        const car = allCars.find(c => c.id === id);
        if (!car) {
          Alert.alert('Erro', 'Veículo não encontrado');
          router.back();
          return;
        }
        setFormData({
          name: car.name,
          brand: car.brand,
          model: car.model,
          year: car.year.toString(),
          km: car.km.toString(),
          price: car.price.toString(),
          imageUrl: '',
          currentImageUrl: car.image,
        });
        if (car.brand) {
          const names = Object.keys(carDatabase[car.brand] || {});
          setAvailableNames(names);
          if (car.name) {
            const modelInfo = carDatabase[car.brand]?.[car.name];
            if (modelInfo) {
              setCurrentYearRange({ start: modelInfo.yearStart, end: modelInfo.yearEnd });
              setAvailableYears(generateYearList(modelInfo.yearStart, modelInfo.yearEnd));
              setAvailableVersions(modelInfo.versions);
            }
          }
        }
      } finally {
        setInitialLoading(false);
      }
    };
    loadCarData();
  }, [id, router]);

  const handleChange = (field: keyof EditFormData, value: string) => {
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
    if (!formData.imageUrl.trim() && !formData.currentImageUrl) {
      Alert.alert('Erro', 'É necessário informar uma URL de imagem');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const finalImage = formData.imageUrl.trim() || formData.currentImageUrl;

      const allCars = await fetchCars();
      const updatedCars = allCars.map(car => {
        if (car.id === id) {
          return {
            ...car,
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            year: parseInt(formData.year),
            km: parseInt(formData.km),
            price: parseInt(formData.price),
            image: finalImage,
            updatedAt: new Date().toISOString(),
          };
        }
        return car;
      });

      await updateCars(updatedCars);
      setSuccessMessage('✓ Veículo atualizado com sucesso!');
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      Alert.alert('Erro', `Não foi possível atualizar o veículo.\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>Carregando dados do veículo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Veículo</Text>
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
          {formData.currentImageUrl !== '' && formData.imageUrl.trim() === '' && (
            <Text style={styles.helperText}>
              Imagem atual: {formData.currentImageUrl.substring(0, 40)}...
            </Text>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Atualizar Veículo</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  currentImageLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
  },
  newImageLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
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
});