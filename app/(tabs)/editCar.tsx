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
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { database } from '../../services/connectionFirebase';
import { ref, update, get } from 'firebase/database';

// Mesmo database do addCar
interface CarModelInfo {
  versions: string[];
  yearStart: number;
  yearEnd: number;
}

const carDatabase: Record<string, Record<string, CarModelInfo>> = {
  'Fiat': {
    'Uno': { versions: ['Vivace', 'Way', 'Sporting'], yearStart: 1984, yearEnd: 2021 },
    'Mobi': { versions: ['Like', 'Trekking'], yearStart: 2016, yearEnd: 2026 },
    'Argo': { versions: ['1.0', 'Drive', 'Trekking', 'HGT'], yearStart: 2017, yearEnd: 2026 },
    'Cronos': { versions: ['Drive', 'Precision'], yearStart: 2018, yearEnd: 2026 },
    'Pulse': { versions: ['Drive', 'Audace', 'Impetus', 'Abarth'], yearStart: 2021, yearEnd: 2026 },
    'Fastback': { versions: ['Audace', 'Impetus', 'Abarth'], yearStart: 2022, yearEnd: 2026 },
    'Toro': { versions: ['Endurance', 'Freedom', 'Volcano', 'Ranch', 'Ultra'], yearStart: 2016, yearEnd: 2026 },
    'Strada': { versions: ['Endurance', 'Freedom', 'Volcano', 'Ranch'], yearStart: 2020, yearEnd: 2026 },
    'Siena': { versions: ['EL', 'HLX'], yearStart: 1997, yearEnd: 2017 },
    'Palio': { versions: ['Fire', 'Attractive', 'Essence', 'Sporting'], yearStart: 1996, yearEnd: 2018 }
  },
  'Volkswagen': {
    'Gol': { versions: ['1.0', 'Trendline', 'Comfortline'], yearStart: 1980, yearEnd: 2022 },
    'Polo': { versions: ['MPI', 'TSI', 'Comfortline', 'Highline', 'GTS'], yearStart: 2017, yearEnd: 2026 },
    'Virtus': { versions: ['MSI', 'Comfortline', 'Highline', 'Exclusive'], yearStart: 2018, yearEnd: 2026 },
    'Nivus': { versions: ['Comfortline', 'Highline'], yearStart: 2020, yearEnd: 2026 },
    'T-Cross': { versions: ['Sense', '200 TSI', 'Comfortline', 'Highline'], yearStart: 2019, yearEnd: 2026 },
    'Taos': { versions: ['Comfortline', 'Highline'], yearStart: 2021, yearEnd: 2026 },
    'Saveiro': { versions: ['Robust', 'Trendline', 'Cross'], yearStart: 1982, yearEnd: 2026 },
    'Jetta': { versions: ['Comfortline', 'R-Line', 'GLI'], yearStart: 2006, yearEnd: 2026 },
    'Passat': { versions: ['Comfortline', 'Highline'], yearStart: 2006, yearEnd: 2020 },
    'Amarok': { versions: ['SE', 'Comfortline', 'Highline', 'Extreme'], yearStart: 2010, yearEnd: 2026 }
  },
  'Chevrolet': {
    'Onix': { versions: ['LS', 'LT', 'LTZ', 'Premier', 'RS'], yearStart: 2012, yearEnd: 2026 },
    'Onix Plus': { versions: ['LT', 'LTZ', 'Premier'], yearStart: 2019, yearEnd: 2026 },
    'Tracker': { versions: ['AT', 'LT', 'LTZ', 'Premier', 'RS'], yearStart: 2020, yearEnd: 2026 },
    'S10': { versions: ['LS', 'LT', 'LTZ', 'High Country'], yearStart: 1995, yearEnd: 2026 },
    'Montana': { versions: ['MT', 'LT', 'LTZ', 'Premier'], yearStart: 2023, yearEnd: 2026 },
    'Spin': { versions: ['LS', 'LT', 'Premier'], yearStart: 2012, yearEnd: 2026 },
    'Cruze': { versions: ['LT', 'LTZ', 'Premier', 'Sport6'], yearStart: 2011, yearEnd: 2023 },
    'Equinox': { versions: ['LT', 'Premier'], yearStart: 2017, yearEnd: 2026 },
    'Trailblazer': { versions: ['LT', 'Premier'], yearStart: 2012, yearEnd: 2021 },
    'Corsa': { versions: ['Wind', 'GL', 'GLS'], yearStart: 1994, yearEnd: 2012 }
  },
  'Ford': {
    'Ka': { versions: ['S', 'SE', 'SEL'], yearStart: 1997, yearEnd: 2021 },
    'Fiesta': { versions: ['S', 'SE', 'Titanium'], yearStart: 1995, yearEnd: 2019 },
    'Focus': { versions: ['S', 'SE', 'Titanium'], yearStart: 2000, yearEnd: 2019 },
    'Fusion': { versions: ['SEL', 'Titanium', 'Hybrid'], yearStart: 2006, yearEnd: 2020 },
    'Ranger': { versions: ['XL', 'XLS', 'XLT', 'Limited'], yearStart: 1994, yearEnd: 2026 },
    'Ecosport': { versions: ['SE', 'Freestyle', 'Titanium'], yearStart: 2003, yearEnd: 2021 },
    'Territory': { versions: ['SEL', 'Titanium'], yearStart: 2020, yearEnd: 2026 },
    'Maverick': { versions: ['Lariat', 'FX4'], yearStart: 2022, yearEnd: 2026 },
    'Edge': { versions: ['SEL', 'Titanium'], yearStart: 2015, yearEnd: 2020 },
    'Bronco': { versions: ['Sport', 'Wildtrak'], yearStart: 2021, yearEnd: 2026 }
  },
  'Hyundai': {
    'HB20': { versions: ['Sense', 'Comfort', 'Limited', 'Platinum'], yearStart: 2012, yearEnd: 2026 },
    'HB20S': { versions: ['Comfort', 'Limited', 'Platinum'], yearStart: 2013, yearEnd: 2026 },
    'Creta': { versions: ['Action', 'Comfort', 'Limited', 'Platinum', 'N Line'], yearStart: 2017, yearEnd: 2026 },
    'Tucson': { versions: ['GL', 'GLS'], yearStart: 2005, yearEnd: 2026 },
    'Santa Fe': { versions: ['V6', 'AWD'], yearStart: 2006, yearEnd: 2020 },
    'ix35': { versions: ['GL', 'GLS'], yearStart: 2010, yearEnd: 2021 },
    'Azera': { versions: ['GLS'], yearStart: 2006, yearEnd: 2017 },
    'Kona': { versions: ['EV'], yearStart: 2018, yearEnd: 2026 },
    'Venue': { versions: ['SE', 'Limited'], yearStart: 2020, yearEnd: 2026 },
    'Elantra': { versions: ['GLS'], yearStart: 2012, yearEnd: 2018 }
  },
  'Toyota': {
    'Corolla': { versions: ['GLi', 'XEi', 'Altis', 'Altis Premium', 'GR-S', 'Hybrid'], yearStart: 1994, yearEnd: 2026 },
    'Corolla Cross': { versions: ['XR', 'XRE', 'XRX', 'Hybrid'], yearStart: 2021, yearEnd: 2026 },
    'Hilux': { versions: ['STD', 'SR', 'SRV', 'SRX', 'GR-Sport'], yearStart: 1992, yearEnd: 2026 },
    'SW4': { versions: ['SRX', 'Diamond'], yearStart: 2005, yearEnd: 2026 },
    'Yaris': { versions: ['XL', 'XS', 'XLS'], yearStart: 2018, yearEnd: 2026 },
    'Yaris Sedan': { versions: ['XL', 'XS', 'XLS'], yearStart: 2018, yearEnd: 2026 },
    'Etios': { versions: ['X', 'XS', 'XLS'], yearStart: 2012, yearEnd: 2021 },
    'Camry': { versions: ['XLE Hybrid'], yearStart: 2000, yearEnd: 2020 },
    'RAV4': { versions: ['SX Hybrid'], yearStart: 2018, yearEnd: 2026 },
    'Prius': { versions: ['Hybrid'], yearStart: 2013, yearEnd: 2021 }
  },
  'Renault': {
    'Kwid': { versions: ['Zen', 'Intense', 'Outsider'], yearStart: 2017, yearEnd: 2026 },
    'Sandero': { versions: ['Life', 'Zen', 'Intense'], yearStart: 2007, yearEnd: 2024 },
    'Logan': { versions: ['Life', 'Zen', 'Intense'], yearStart: 2007, yearEnd: 2024 },
    'Stepway': { versions: ['Zen', 'Intense'], yearStart: 2008, yearEnd: 2024 },
    'Duster': { versions: ['Zen', 'Intense', 'Iconic'], yearStart: 2011, yearEnd: 2026 },
    'Oroch': { versions: ['Pro', 'Intense', 'Outsider'], yearStart: 2015, yearEnd: 2026 },
    'Kardian': { versions: ['Evolution', 'Techno'], yearStart: 2023, yearEnd: 2026 },
    'Captur': { versions: ['Zen', 'Intense'], yearStart: 2016, yearEnd: 2026 },
    'Fluence': { versions: ['Dynamique', 'Privilege'], yearStart: 2011, yearEnd: 2017 },
    'Clio': { versions: ['Authentique', 'Expression'], yearStart: 1999, yearEnd: 2014 }
  },
  'Honda': {
    'Civic': { versions: ['LX', 'EX', 'EXL', 'Touring', 'Si'], yearStart: 1992, yearEnd: 2026 },
    'City': { versions: ['LX', 'EX', 'EXL', 'Touring'], yearStart: 2009, yearEnd: 2026 },
    'City Hatch': { versions: ['EX', 'EXL', 'Touring'], yearStart: 2021, yearEnd: 2026 },
    'Fit': { versions: ['LX', 'EX', 'EXL'], yearStart: 2003, yearEnd: 2021 },
    'HR-V': { versions: ['LX', 'EX', 'EXL', 'Touring'], yearStart: 2015, yearEnd: 2026 },
    'WR-V': { versions: ['LX', 'EX'], yearStart: 2017, yearEnd: 2022 },
    'Accord': { versions: ['Touring Hybrid'], yearStart: 1995, yearEnd: 2020 },
    'CR-V': { versions: ['EXL', 'Touring'], yearStart: 2007, yearEnd: 2026 },
    'ZR-V': { versions: ['Touring'], yearStart: 2023, yearEnd: 2026 },
    'Insight': { versions: ['Hybrid'], yearStart: 2019, yearEnd: 2022 }
  },
  'Nissan': {
    'Kicks': { versions: ['Sense', 'Advance', 'Exclusive'], yearStart: 2016, yearEnd: 2026 },
    'Versa': { versions: ['Sense', 'Advance', 'Exclusive'], yearStart: 2011, yearEnd: 2026 },
    'Sentra': { versions: ['Advance', 'Exclusive'], yearStart: 2007, yearEnd: 2026 },
    'Frontier': { versions: ['S', 'SE', 'LE', 'Platinum'], yearStart: 1998, yearEnd: 2026 },
    'March': { versions: ['S', 'SV'], yearStart: 2011, yearEnd: 2020 },
    'Livina': { versions: ['SL'], yearStart: 2008, yearEnd: 2015 },
    'X-Trail': { versions: ['SL'], yearStart: 2008, yearEnd: 2015 },
    'Pathfinder': { versions: ['Exclusive'], yearStart: 2013, yearEnd: 2017 },
    'Leaf': { versions: ['EV'], yearStart: 2017, yearEnd: 2026 },
    'Altima': { versions: ['SL'], yearStart: 2018, yearEnd: 2023 }
  },
  'Peugeot': {
    '208': { versions: ['Like', 'Active', 'Allure', 'Griffe'], yearStart: 2013, yearEnd: 2026 },
    '2008': { versions: ['Allure', 'Griffe'], yearStart: 2015, yearEnd: 2026 },
    '3008': { versions: ['Griffe'], yearStart: 2017, yearEnd: 2020 },
    '5008': { versions: ['Griffe'], yearStart: 2018, yearEnd: 2020 },
    '308': { versions: ['Active', 'Allure'], yearStart: 2012, yearEnd: 2023 },
    '408': { versions: ['Allure', 'Griffe'], yearStart: 2010, yearEnd: 2018 },
    '206': { versions: ['Selection', 'Presence'], yearStart: 2001, yearEnd: 2012 },
    '207': { versions: ['XR', 'XS'], yearStart: 2008, yearEnd: 2014 },
    'Partner': { versions: ['Rapid'], yearStart: 2000, yearEnd: 2015 },
    'RCZ': { versions: ['THP'], yearStart: 2010, yearEnd: 2015 }
  },
  'Citroën': {
    'C3': { versions: ['Live', 'Feel', 'Shine'], yearStart: 2003, yearEnd: 2026 },
    'C3 Aircross': { versions: ['Feel', 'Shine'], yearStart: 2018, yearEnd: 2026 },
    'C4 Cactus': { versions: ['Feel', 'Shine'], yearStart: 2018, yearEnd: 2026 },
    'Basalt': { versions: ['Feel', 'Shine'], yearStart: 2023, yearEnd: 2026 },
    'C4 Lounge': { versions: ['Feel', 'Shine'], yearStart: 2013, yearEnd: 2020 },
    'C5': { versions: ['Exclusive'], yearStart: 2005, yearEnd: 2015 },
    'Xsara': { versions: ['GLX'], yearStart: 1998, yearEnd: 2006 },
    'Picasso': { versions: ['GLX'], yearStart: 2000, yearEnd: 2010 },
    'Berlingo': { versions: ['Business'], yearStart: 2005, yearEnd: 2015 },
    'DS3': { versions: ['Chic', 'Sport'], yearStart: 2010, yearEnd: 2016 }
  },
  'Mitsubishi': {
    'Lancer': { versions: ['HL', 'HLE', 'GT'], yearStart: 1992, yearEnd: 2019 },
    'ASX': { versions: ['4x2', '4x4'], yearStart: 2010, yearEnd: 2026 },
    'Outlander': { versions: ['Comfort', 'GT'], yearStart: 2008, yearEnd: 2026 },
    'Eclipse Cross': { versions: ['HPE', 'HPE-S'], yearStart: 2018, yearEnd: 2026 },
    'Pajero': { versions: ['Full', 'Sport'], yearStart: 1991, yearEnd: 2021 },
    'Pajero Sport': { versions: ['HPE', 'HPE-S'], yearStart: 2015, yearEnd: 2026 },
    'Triton': { versions: ['GL', 'GLS', 'HPE', 'HPE-S'], yearStart: 2008, yearEnd: 2026 },
    'L200': { versions: ['Outdoor', 'Triton'], yearStart: 1995, yearEnd: 2026 },
    'Airtrek': { versions: ['EV'], yearStart: 2022, yearEnd: 2026 },
    'Galant': { versions: ['ES'], yearStart: 1995, yearEnd: 2010 }
  },
  'Jeep': {
    'Renegade': { versions: ['Sport', 'Longitude', 'Limited', 'Trailhawk'], yearStart: 2015, yearEnd: 2026 },
    'Compass': { versions: ['Sport', 'Longitude', 'Limited', 'Trailhawk', 'S'], yearStart: 2017, yearEnd: 2026 },
    'Commander': { versions: ['Longitude', 'Limited', 'Overland'], yearStart: 2021, yearEnd: 2026 },
    'Wrangler': { versions: ['Sport', 'Sahara', 'Rubicon'], yearStart: 1997, yearEnd: 2026 },
    'Gladiator': { versions: ['Rubicon'], yearStart: 2020, yearEnd: 2026 },
    'Cherokee': { versions: ['Longitude', 'Trailhawk'], yearStart: 2014, yearEnd: 2020 },
    'Grand Cherokee': { versions: ['Limited', 'Summit'], yearStart: 2005, yearEnd: 2020 },
    'Wagoneer': { versions: ['Series II'], yearStart: 2021, yearEnd: 2026 },
    'Patriot': { versions: ['Sport'], yearStart: 2008, yearEnd: 2015 },
    'Liberty': { versions: ['Sport'], yearStart: 2002, yearEnd: 2012 }
  },
  'Caoa Chery': {
    'Tiggo 2': { versions: ['Look'], yearStart: 2018, yearEnd: 2022 },
    'Tiggo 3X': { versions: ['Pro'], yearStart: 2019, yearEnd: 2026 },
    'Tiggo 5X': { versions: ['Sport', 'Pro', 'Pro Hybrid'], yearStart: 2019, yearEnd: 2026 },
    'Tiggo 7': { versions: ['Pro', 'Hybrid'], yearStart: 2020, yearEnd: 2026 },
    'Tiggo 8': { versions: ['Max Drive', 'Plug-in Hybrid'], yearStart: 2020, yearEnd: 2026 },
    'Arrizo 5': { versions: ['RX'], yearStart: 2018, yearEnd: 2024 },
    'Arrizo 6': { versions: ['Pro', 'GSX'], yearStart: 2019, yearEnd: 2026 },
    'iCar': { versions: ['EV'], yearStart: 2022, yearEnd: 2026 },
    'QQ': { versions: ['Smile'], yearStart: 2005, yearEnd: 2015 },
    'Cielo': { versions: ['Hatch', 'Sedan'], yearStart: 2000, yearEnd: 2010 }
  }
};

const availableBrands = Object.keys(carDatabase);

// Função para gerar lista de anos
const generateYearList = (start: number, end: number): string[] => {
  const years: string[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year.toString());
  }
  return years.reverse();
};

// URL de imagem pra não ficar sem foto quando postar algo sem foto
const getValidImageUrl = (url: string): string => {
  if (!url || url.includes('via.placeholder.com')) {
    return `https://picsum.photos/400/300?random=${Date.now()}`;
  }
  return url;
};

interface CarData {
  name: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  image: string;
}

export default function EditCarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [yearModalVisible, setYearModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    km: '',
    price: '',
    image: '',
  });

  const [availableNames, setAvailableNames] = useState<string[]>([]);
  const [availableVersions, setAvailableVersions] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [, setCurrentYearRange] = useState({ start: 2000, end: 2026 });

  // Carregar dados do veículo
  useEffect(() => {
    const loadCarData = async () => {
      if (!id) {
        Alert.alert('Erro', 'ID do veículo não encontrado');
        router.back();
        return;
      }

      try {
        const carRef = ref(database, `cars/${id}`);
        const snapshot = await get(carRef);
        
        if (snapshot.exists()) {
          const carData = snapshot.val() as CarData;
          setFormData({
            name: carData.name || '',
            brand: carData.brand || '',
            model: carData.model || '',
            year: carData.year ? carData.year.toString() : '',
            km: carData.km ? carData.km.toString() : '',
            price: carData.price ? carData.price.toString() : '',
            image: carData.image || '',
          });

          // Carregar opções baseadas na marca selecionada
          if (carData.brand) {
            const names = Object.keys(carDatabase[carData.brand] || {});
            setAvailableNames(names);
            
            if (carData.name) {
              const modelInfo = carDatabase[carData.brand]?.[carData.name];
              if (modelInfo) {
                setCurrentYearRange({ start: modelInfo.yearStart, end: modelInfo.yearEnd });
                const years = generateYearList(modelInfo.yearStart, modelInfo.yearEnd);
                setAvailableYears(years);
                
                const versions = modelInfo.versions;
                setAvailableVersions(versions);
              }
            }
          }
        } else {
          Alert.alert('Erro', 'Veículo não encontrado');
          router.back();
        }
      } catch (error) {
        console.error('Erro ao carregar veículo:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do veículo');
        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    loadCarData();
  }, [id, router]);

  const handleChange = (field: string, value: string) => {
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

      setFormData(prev => ({
        ...prev,
        name,
        model: '',
        year: years[0] || ''
      }));

      const versions = modelInfo.versions;
      setAvailableVersions(versions);
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
    if (!formData.brand.trim()) {
      Alert.alert('Erro', 'Marca é obrigatória');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome do veículo é obrigatório');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Erro', 'Versão/Modelo é obrigatório');
      return false;
    }
    if (!formData.year.trim() || isNaN(Number(formData.year))) {
      Alert.alert('Erro', 'Ano inválido');
      return false;
    }
    if (!formData.km.trim() || isNaN(Number(formData.km))) {
      Alert.alert('Erro', 'Quilometragem inválida');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      Alert.alert('Erro', 'Preço inválido');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    if (!id) return;

    setLoading(true);
    try {
      const carRef = ref(database, `cars/${id}`);
      const updatedCar = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        km: parseInt(formData.km),
        price: parseInt(formData.price),
        image: getValidImageUrl(formData.image),
        updatedAt: new Date().toISOString(),
      };

      await update(carRef, updatedCar);

      Alert.alert(
        'Sucesso!',
        'Veículo atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o veículo. Tente novamente.');
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
        <View style={styles.formCard}>
          <Text style={styles.label}>Marca</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setBrandModalVisible(true)}
          >
            <Text style={[
              styles.selectorText,
              !formData.brand && styles.selectorPlaceholder
            ]}>
              {formData.brand || 'Selecione uma marca'}
            </Text>
            <Feather name="chevron-down" size={20} color="#999" />
          </TouchableOpacity>

          <Text style={styles.label}>Nome do Veículo</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.brand && styles.selectorDisabled]}
            onPress={() => formData.brand && setNameModalVisible(true)}
            disabled={!formData.brand}
          >
            <Text style={[
              styles.selectorText,
              !formData.name && styles.selectorPlaceholder,
              !formData.brand && styles.selectorDisabledText
            ]}>
              {formData.name || (formData.brand ? 'Selecione o modelo' : 'Primeiro selecione a marca')}
            </Text>
            {formData.brand && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          <Text style={styles.label}>Versão ou Modelo</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.name && styles.selectorDisabled]}
            onPress={() => formData.name && setVersionModalVisible(true)}
            disabled={!formData.name}
          >
            <Text style={[
              styles.selectorText,
              !formData.model && styles.selectorPlaceholder,
              !formData.name && styles.selectorDisabledText
            ]}>
              {formData.model || (formData.name ? 'Selecione a versão' : 'Primeiro selecione o modelo')}
            </Text>
            {formData.name && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          <Text style={styles.label}>Ano</Text>
          <TouchableOpacity
            style={[styles.selector, !formData.name && styles.selectorDisabled]}
            onPress={() => formData.name && setYearModalVisible(true)}
            disabled={!formData.name}
          >
            <Text style={[
              styles.selectorText,
              !formData.year && styles.selectorPlaceholder,
              !formData.name && styles.selectorDisabledText
            ]}>
              {formData.year || (formData.name ? 'Selecione o ano' : 'Primeiro selecione o modelo')}
            </Text>
            {formData.name && <Feather name="chevron-down" size={20} color="#999" />}
          </TouchableOpacity>

          <Text style={styles.label}>Quilometragem (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 45000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.km}
            onChangeText={(text) => handleChange('km', text)}
          />

          <Text style={styles.label}>Preço (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 35000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
          />

          <Text style={styles.label}>URL da Imagem</Text>
          <TextInput
            style={styles.input}
            placeholder="https://exemplo.com/imagem.jpg"
            placeholderTextColor="#999"
            value={formData.image}
            onChangeText={(text) => handleChange('image', text)}
          />
          <Text style={styles.helperText}>
            Não se esqueça da imagem, caso esqueça, por padrão será usada uma imagem aleatória para representar o veículo.
          </Text>

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

      {/* Modal para a marca do carro */}
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
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleBrandSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.brand === item && (
                    <Feather name="check" size={20} color="#d32f2f" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para o nome do carro */}
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
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleNameSelect(item)}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={styles.modalItemText}>{item}</Text>
                    <Text style={styles.yearRangeText}>
                      {`${carDatabase[formData.brand]?.[item]?.yearStart} - ${carDatabase[formData.brand]?.[item]?.yearEnd}`}
                    </Text>
                  </View>
                  {formData.name === item && (
                    <Feather name="check" size={20} color="#d32f2f" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para a versão do carro */}
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
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleVersionSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.model === item && (
                    <Feather name="check" size={20} color="#d32f2f" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para o ano do carro */}
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
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleYearSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.year === item && (
                    <Feather name="check" size={20} color="#d32f2f" />
                  )}
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
});