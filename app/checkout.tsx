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
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'expo-router';

type ShippingType = 'normal' | 'expresso';

// CEP da empresa (matriz)
const COMPANY_CEP = '15640-047';

// Coordenadas da empresa (preenchidas ao iniciar)
let companyLatLng: { lat: number; lng: number } | null = null;

// Busca endereço e coordenadas via AwesomeAPI (gratuito, sem chave)
const fetchCepData = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) throw new Error('CEP inválido');
  const response = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`);
  if (!response.ok) throw new Error('CEP não encontrado');
  const data = await response.json();
  return {
    cep: data.cep,
    logradouro: data.address,
    bairro: data.district,
    cidade: data.city,
    uf: data.state,
    lat: parseFloat(data.lat),
    lng: parseFloat(data.lng),
  };
};

// Cálculo da distância entre dois pontos (Haversine) – resultado em km
const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Determina preço do frete com base na distância (km)
const getShippingPrice = (distanceKm: number, type: ShippingType) => {
  if (distanceKm <= 50) return 0; // frete grátis dentro de 50 km
  if (distanceKm <= 200) {
    return type === 'normal' ? 20 : 35;
  }
  return type === 'normal' ? 35 : 50;
};

// Máscara de CEP (xxxxx-xxx)
const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

export default function CheckoutScreen() {
  const { cartItems, getTotalPrice } = useCart();
  const router = useRouter();

  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [shippingType, setShippingType] = useState<ShippingType>('normal');
  const [shippingPrice, setShippingPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const subtotal = getTotalPrice();
  const total = subtotal + shippingPrice - discount;

  // Carregar coordenadas da empresa uma vez ao montar
  useEffect(() => {
    const loadCompanyCoords = async () => {
      try {
        const data = await fetchCepData(COMPANY_CEP);
        companyLatLng = { lat: data.lat, lng: data.lng };
      } catch (error) {
        console.error('Erro ao carregar coordenadas da empresa:', error);
      }
    };
    loadCompanyCoords();
  }, []);

  const loadAddressForCep = async (cepValue: string) => {
    setLoadingAddress(true);
    setAddressError('');
    try {
      const data = await fetchCepData(cepValue);
      setAddress(data);
      // Se já temos as coordenadas da empresa, calcula o frete
      if (companyLatLng) {
        const distance = getDistanceInKm(companyLatLng.lat, companyLatLng.lng, data.lat, data.lng);
        const price = getShippingPrice(distance, shippingType);
        setShippingPrice(price);
      } else {
        // Caso as coordenadas da empresa ainda não tenham carregado, tenta novamente em breve
        setTimeout(() => loadAddressForCep(cepValue), 500);
      }
    } catch (err: any) {
      setAddressError(err.message);
      setAddress(null);
      setShippingPrice(0);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      loadAddressForCep(formatted);
    } else {
      setAddress(null);
      setShippingPrice(0);
    }
  };

  // Recalcula o frete quando o tipo de entrega mudar
  useEffect(() => {
    if (address && companyLatLng) {
      const distance = getDistanceInKm(companyLatLng.lat, companyLatLng.lng, address.lat, address.lng);
      const price = getShippingPrice(distance, shippingType);
      setShippingPrice(price);
    }
  }, [shippingType, address]);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setDiscount(0);
      setCouponMessage('');
      return;
    }
    // Cupons fixos – você pode depois integrar com Firebase
    if (code === 'DESCONTO10') {
      setDiscount(subtotal * 0.1);
      setCouponMessage('✅ Cupom DESCONTO10: 10% de desconto');
    } else if (code === 'DESCONTO20') {
      setDiscount(subtotal * 0.2);
      setCouponMessage('✅ Cupom DESCONTO20: 20% de desconto');
    } else if (code === 'FRETEGRÁTIS') {
      setDiscount(shippingPrice);
      setCouponMessage('✅ Frete grátis aplicado!');
    } else {
      setDiscount(0);
      setCouponMessage('❌ Cupom inválido');
    }
  };

  const handleFinalize = () => {
    if (!address) {
      Alert.alert('CEP não informado', 'Digite um CEP válido para continuar.');
      return;
    }
    let message = `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    message += `Frete (${shippingType === 'normal' ? 'Normal' : 'Expresso'}): R$ ${shippingPrice.toFixed(2)}\n`;
    if (discount > 0) message += `Desconto: - R$ ${discount.toFixed(2)}\n`;
    message += `Total: R$ ${total.toFixed(2)}`;
    Alert.alert('Compra finalizada', message, [
      { text: 'OK', onPress: () => router.replace('/(tabs)/products') }
    ]);
  };

  if (cartItems.length === 0) {
    router.replace('/cart');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar compra</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Seção CEP */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Local de entrega</Text>
          <View style={styles.cepRow}>
            <TextInput
              style={styles.cepInput}
              placeholder="Digite seu CEP"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={cep}
              onChangeText={handleCepChange}
              maxLength={9}
            />
            {loadingAddress && <ActivityIndicator size="small" color="#d32f2f" style={{ marginLeft: 8 }} />}
          </View>
          {addressError ? (
            <Text style={styles.errorText}>{addressError}</Text>
          ) : address ? (
            <View style={styles.addressBox}>
              <Text style={styles.addressText}>{address.logradouro}, {address.bairro}</Text>
              <Text style={styles.addressText}>{address.cidade} - {address.uf}</Text>
            </View>
          ) : null}
        </View>

        {/* Tipo de entrega (só aparece se endereço foi carregado) */}
        {address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo de entrega</Text>
            <View style={styles.shippingOptions}>
              <TouchableOpacity
                style={[styles.shippingOption, shippingType === 'normal' && styles.shippingOptionActive]}
                onPress={() => setShippingType('normal')}
              >
                <Feather name="truck" size={20} color={shippingType === 'normal' ? '#fff' : '#d32f2f'} />
                <Text style={[styles.shippingOptionText, shippingType === 'normal' && styles.shippingOptionTextActive]}>
                  Normal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shippingOption, shippingType === 'expresso' && styles.shippingOptionActive]}
                onPress={() => setShippingType('expresso')}
              >
                <Feather name="zap" size={20} color={shippingType === 'expresso' ? '#fff' : '#d32f2f'} />
                <Text style={[styles.shippingOptionText, shippingType === 'expresso' && styles.shippingOptionTextActive]}>
                  Expresso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Cupom */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cupom de desconto</Text>
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Código (ex: DESCONTO10)"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <TouchableOpacity style={styles.applyButton} onPress={applyCoupon}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {couponMessage ? (
            <Text style={[styles.couponMessage, couponMessage.includes('❌') && styles.couponError]}>
              {couponMessage}
            </Text>
          ) : null}
        </View>

        {/* Totalização */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do pedido</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>R$ {subtotal.toFixed(2)}</Text>
          </View>
          {shippingPrice > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frete</Text>
              <Text style={styles.totalValue}>R$ {shippingPrice.toFixed(2)}</Text>
            </View>
          )}
          {shippingPrice === 0 && address && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frete</Text>
              <Text style={[styles.totalValue, styles.freeShippingText]}>Grátis!</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Desconto</Text>
              <Text style={[styles.totalValue, styles.discountText]}>- R$ {discount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
          <Text style={styles.finalizeText}>Finalizar compra</Text>
          <Feather name="check-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
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
    color: '#333',
    marginBottom: 16,
  },
  cepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cepInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#d32f2f',
  },
  addressBox: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shippingOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  shippingOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shippingOptionActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  shippingOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  shippingOptionTextActive: {
    color: '#fff',
  },
  couponRow: {
    flexDirection: 'row',
    gap: 12,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  couponMessage: {
    marginTop: 8,
    fontSize: 12,
    color: '#2e7d32',
  },
  couponError: {
    color: '#d32f2f',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  freeShippingText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  discountText: {
    color: '#2e7d32',
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  finalizeButton: {
    backgroundColor: '#d32f2f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  finalizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});