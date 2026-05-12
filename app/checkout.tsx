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
import { fetchCoupons, Coupon } from '../services/couponService';

type ShippingType = 'normal' | 'expresso';

const COMPANY_CEP_PREFIX = '15640';
const shippingTable = {
  sameCity: { normal: 0, expresso: 10 },
  sameState: { normal: 20, expresso: 35 },
  otherState: { normal: 35, expresso: 50 },
};

const fetchAddressByCep = async (cep: string) => {
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
    cepPrefix: data.cep.substring(0, 5),
  };
};

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
  const [couponsList, setCouponsList] = useState<Record<string, Coupon>>({});

  const subtotal = getTotalPrice();
  const total = subtotal + shippingPrice - discount;

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const data = await fetchCoupons();
        setCouponsList(data);
      } catch (error) {
        console.error('Erro ao carregar cupons', error);
      }
    };
    loadCoupons();
  }, []);

  const calculateShipping = (addressData: any, type: ShippingType) => {
    if (!addressData) return 0;
    const sameCity = addressData.cepPrefix === COMPANY_CEP_PREFIX;
    const sameState = addressData.uf === 'SP';
    if (sameCity) return shippingTable.sameCity[type];
    if (sameState) return shippingTable.sameState[type];
    return shippingTable.otherState[type];
  };

  const loadAddressForCep = async (cepValue: string) => {
    setLoadingAddress(true);
    setAddressError('');
    try {
      const data = await fetchAddressByCep(cepValue);
      setAddress(data);
      const price = calculateShipping(data, shippingType);
      setShippingPrice(price);
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

  useEffect(() => {
    if (address) {
      const price = calculateShipping(address, shippingType);
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
    const coupon = couponsList[code];
    if (!coupon || !coupon.active) {
      setDiscount(0);
      setCouponMessage('Cupom inválido ou expirado');
      return;
    }
    if (coupon.type === 'percentage') {
      const discountValue = subtotal * (coupon.value / 100);
      setDiscount(discountValue);
      setCouponMessage(`Cupom ${code}: ${coupon.value}% de desconto`);
    } else if (coupon.type === 'free_shipping') {
      setDiscount(shippingPrice);
      setCouponMessage(`Cupom ${code}: frete grátis`);
    } else {
      setDiscount(0);
      setCouponMessage('Cupom não aplicável');
    }
  };

  const handleFinalize = () => {
    if (!address) {
      Alert.alert('CEP não informado', 'Digite um CEP válido para continuar.');
      return;
    }
    let message = `Subtotal: R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    message += `Frete (${shippingType === 'normal' ? 'Normal' : 'Expresso'}): R$ ${shippingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    if (discount > 0) message += `Desconto: - R$ ${discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    message += `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    Alert.alert('Compra finalizada', message, [
      { text: 'OK', onPress: () => router.replace('/(tabs)/products') },
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {/* CEP e endereço */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Local de entrega</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu CEP"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={cep}
              onChangeText={handleCepChange}
              maxLength={9}
            />
            {loadingAddress && <ActivityIndicator size="small" color="#d32f2f" style={{ marginTop: 8 }} />}
            {addressError ? (
              <Text style={styles.errorText}>{addressError}</Text>
            ) : address ? (
              <View style={styles.addressBox}>
                <Text style={styles.addressText}>{address.logradouro}, {address.bairro}</Text>
                <Text style={styles.addressText}>{address.cidade} - {address.uf}</Text>
              </View>
            ) : null}
          </View>

          {/* Opções de entrega */}
          {address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tipo de entrega</Text>
              <View style={styles.rowButtons}>
                <TouchableOpacity
                  style={[styles.optionButton, shippingType === 'normal' && styles.optionButtonActive]}
                  onPress={() => setShippingType('normal')}
                >
                  <Feather name="truck" size={20} color={shippingType === 'normal' ? '#fff' : '#d32f2f'} />
                  <Text style={[styles.optionText, shippingType === 'normal' && styles.optionTextActive]}>Normal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, shippingType === 'expresso' && styles.optionButtonActive]}
                  onPress={() => setShippingType('expresso')}
                >
                  <Feather name="zap" size={20} color={shippingType === 'expresso' ? '#fff' : '#d32f2f'} />
                  <Text style={[styles.optionText, shippingType === 'expresso' && styles.optionTextActive]}>Expresso</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cupom */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Cupom de desconto</Text>
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Código do cupom"
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

          {/* Resumo do pedido */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumo do pedido</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Frete</Text>
              {shippingPrice === 0 && address ? (
                <Text style={[styles.totalValue, styles.freeShipping]}>Grátis!</Text>
              ) : (
                <Text style={styles.totalValue}>
                  R$ {shippingPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              )}
            </View>
            {discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Desconto</Text>
                <Text style={[styles.totalValue, styles.discountValue]}>
                  - R$ {discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
            <Text style={styles.finalizeText}>Finalizar compra</Text>
            <Feather name="check-circle" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
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
  rowButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
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
  optionButtonActive: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  optionTextActive: {
    color: '#fff',
  },
  couponRow: {
    flexDirection: 'row',
    gap: 12,
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
  freeShipping: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  discountValue: {
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