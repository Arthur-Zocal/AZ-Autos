import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  useWindowDimensions,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAdmin } from '../../hooks/useAdmin';
import { fetchCars, updateCars, Car } from '../../services/jsonbinService';

// Filtros (mantidos iguais)
const brands = [
  'Todas', 'Fiat', 'Volkswagen', 'Chevrolet', 'Ford', 'Hyundai',
  'Toyota', 'Renault', 'Honda', 'Nissan', 'Peugeot', 'Citroën',
  'Mitsubishi', 'Jeep', 'Caoa Chery'
];

const kmRanges = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até 10.000 km', min: 0, max: 10000 },
  { label: '10.000 - 30.000 km', min: 10000, max: 30000 },
  { label: '30.000 - 50.000 km', min: 30000, max: 50000 },
  { label: 'Acima de 50.000 km', min: 50000, max: Infinity },
];

const priceRanges = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Até R$ 30.000', min: 0, max: 30000 },
  { label: 'R$ 30.000 - R$ 50.000', min: 30000, max: 50000 },
  { label: 'R$ 50.000 - R$ 80.000', min: 50000, max: 80000 },
  { label: 'R$ 80.000 - R$ 120.000', min: 80000, max: 120000 },
  { label: 'Acima de R$ 120.000', min: 120000, max: Infinity },
];

export default function ProductsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const calculateNumColumns = useCallback(() => {
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 2;
  }, [width]);

  const [numColumns, setNumColumns] = useState(calculateNumColumns());
  const { isAdmin, loading: adminLoading } = useAdmin();

  useEffect(() => {
    const updateColumns = () => {
      setNumColumns(calculateNumColumns());
    };
    const subscription = Dimensions.addEventListener('change', updateColumns);
    return () => subscription?.remove();
  }, [calculateNumColumns]);

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [selectedKmRange, setSelectedKmRange] = useState(kmRanges[0]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);

  const [tempSearchText, setTempSearchText] = useState('');
  const [tempBrand, setTempBrand] = useState('Todas');
  const [tempYear, setTempYear] = useState('Todos');
  const [tempKmRange, setTempKmRange] = useState(kmRanges[0]);
  const [tempPriceRange, setTempPriceRange] = useState(priceRanges[0]);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Carrega carros sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadCars = async () => {
        try {
          const data = await fetchCars();
          if (isActive) setCars(data);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível carregar os veículos.');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      loadCars();
      return () => { isActive = false; };
    }, [])
  );

  const clearTempFilters = () => {
    setTempSearchText('');
    setTempBrand('Todas');
    setTempYear('Todos');
    setTempKmRange(kmRanges[0]);
    setTempPriceRange(priceRanges[0]);
  };

  const applyFilters = () => {
    setSearchText(tempSearchText);
    setSelectedBrand(tempBrand);
    setSelectedYear(tempYear);
    setSelectedKmRange(tempKmRange);
    setSelectedPriceRange(tempPriceRange);
    setFilterModalVisible(false);
  };

  const openFilterModal = () => {
    setTempSearchText(searchText);
    setTempBrand(selectedBrand);
    setTempYear(selectedYear);
    setTempKmRange(selectedKmRange);
    setTempPriceRange(selectedPriceRange);
    setFilterModalVisible(true);
  };

  const confirmEdit = (car: Car) => {
    if (!isAdmin) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para editar veículos.');
      return;
    }
    router.push({
      pathname: '/editCar',
      params: { id: car.id }
    });
  };

  const confirmDelete = (car: Car) => {
    if (!isAdmin) {
      Alert.alert('Acesso Negado', 'Você não tem permissão para remover veículos.');
      return;
    }
    setSelectedCar(car);
    setDeleteModalVisible(true);
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;
    setDeleting(true);
    try {
      const currentCars = await fetchCars();
      const updatedCars = currentCars.filter(car => car.id !== selectedCar.id);
      await updateCars(updatedCars);
      setCars(updatedCars);
      Alert.alert('Sucesso!', 'Veículo removido com sucesso!');
      setDeleteModalVisible(false);
      setSelectedCar(null);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o veículo.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch =
          car.name.toLowerCase().includes(searchLower) ||
          car.brand.toLowerCase().includes(searchLower) ||
          car.model.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (selectedBrand !== 'Todas' && car.brand !== selectedBrand) return false;
      if (selectedYear !== 'Todos') {
        const yearNum = parseInt(selectedYear);
        if (!isNaN(yearNum) && car.year !== yearNum) return false;
      }
      if (car.km < selectedKmRange.min || car.km > selectedKmRange.max) return false;
      if (car.price < selectedPriceRange.min || car.price > selectedPriceRange.max) return false;
      return true;
    });
  }, [cars, searchText, selectedBrand, selectedYear, selectedKmRange, selectedPriceRange]);

  const getCardWidth = () => {
    const padding = 24;
    const gap = 16;
    if (numColumns === 2) {
      return (width - padding * 2 - gap) / 2;
    }
    return (width - padding * 2 - gap * 2) / 3;
  };

  const cardWidth = getCardWidth();

  const renderCarCard = ({ item, index }: { item: Car; index: number }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          marginLeft: index % numColumns === 0 ? 0 : 16,
        }
      ]}>
      <Image
        source={{ uri: item.image }}
        style={[styles.cardImage, { height: cardWidth * 0.7 }]}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDetail} numberOfLines={1}>{`${item.brand} - ${item.model}`}</Text>
        <Text style={styles.cardDetail}>{`${item.year} • ${item.km.toLocaleString()} km`}</Text>
        <Text style={styles.cardPrice}>{`R$ ${item.price.toLocaleString('pt-BR')}`}</Text>
        {isAdmin && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => confirmEdit(item)}>
              <Feather name="edit-2" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item)}>
              <Feather name="trash-2" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading || adminLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d32f2f" />
          <Text style={styles.loadingText}>Carregando veículos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AZ Autos</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={openFilterModal} style={styles.headerButton}>
              <Feather name="filter" size={24} color="#fff" />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                onPress={() => router.push('/addCar')}
                style={styles.headerButton}>
                <Feather name="plus" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Encontre o carro dos seus sonhos!</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome, marca ou modelo..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {`${filteredCars.length} ${filteredCars.length === 1 ? 'carro encontrado' : 'carros encontrados'}`}
        </Text>

        <FlatList
          data={filteredCars}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={item => item.id}
          renderItem={renderCarCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="truck" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Nenhum veículo encontrado</Text>
            </View>
          }
        />
      </View>

      {/* Modal dos Filtros (mantido igual ao original) */}
      <Modal visible={filterModalVisible} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar Carros</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterTitle}>Marca</Text>
              <View style={styles.filterRow}>
                {brands.map(brand => (
                  <TouchableOpacity
                    key={brand}
                    style={[styles.filterButton, tempBrand === brand && styles.filterButtonActive]}
                    onPress={() => setTempBrand(brand)}>
                    <Text style={[styles.filterButtonText, tempBrand === brand && styles.filterButtonTextActive]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterTitle}>Ano</Text>
              <View style={styles.yearInputContainer}>
                <TextInput
                  style={styles.yearInput}
                  placeholder="Digite o ano (ex: 2020)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={4}
                  value={tempYear === 'Todos' ? '' : tempYear}
                  onChangeText={(text) => {
                    if (text === '') {
                      setTempYear('Todos');
                    } else {
                      setTempYear(text);
                    }
                  }}
                />
                {tempYear !== 'Todos' && (
                  <TouchableOpacity style={styles.clearYearButton} onPress={() => setTempYear('Todos')}>
                    <Feather name="x" size={18} color="#666" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.filterTitle}>Quilometragem</Text>
              <View style={styles.filterRow}>
                {kmRanges.map(range => (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.filterButton, tempKmRange.label === range.label && styles.filterButtonActive]}
                    onPress={() => setTempKmRange(range)}>
                    <Text style={[styles.filterButtonText, tempKmRange.label === range.label && styles.filterButtonTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterTitle}>Preço</Text>
              <View style={styles.filterRow}>
                {priceRanges.map(range => (
                  <TouchableOpacity
                    key={range.label}
                    style={[styles.filterButton, tempPriceRange.label === range.label && styles.filterButtonActive]}
                    onPress={() => setTempPriceRange(range)}>
                    <Text style={[styles.filterButtonText, tempPriceRange.label === range.label && styles.filterButtonTextActive]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearTempFilters}>
                <Text style={styles.clearButtonText}>Limpar tudo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de exclusão */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalHeader}>
              <Feather name="alert-triangle" size={40} color="#d32f2f" />
              <Text style={styles.deleteModalTitle}>Remover Veículo</Text>
            </View>
            <Text style={styles.deleteModalText}>
              {`Tem certeza que deseja remover o veículo "${selectedCar?.name} ${selectedCar?.model}"?`}
            </Text>
            <Text style={styles.deleteModalWarning}>Esta ação não pode ser desfeita.</Text>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setSelectedCar(null);
                }}>
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, deleting && styles.buttonDisabled]}
                onPress={handleDeleteCar}
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

// Estilos (mantidos exatamente iguais)
const styles = StyleSheet.create({
  safeArea: {
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    height: 48,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    backgroundColor: '#eee',
  },
  cardInfo: {
    padding: 12,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginTop: 6,
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    padding: 6,
    opacity: 0.9,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    padding: 6,
    opacity: 0.9,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  yearInputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  yearInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  clearYearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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