import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCart, CartItem } from '../contexts/CartContext';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const router = useRouter();

  const subtotal = getTotalPrice();

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.car.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.car.name} {item.car.model}</Text>
        <Text style={styles.price}>R$ {item.car.price.toLocaleString('pt-BR')}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => updateQuantity(item.car.id, item.quantity - 1)}
            style={styles.quantityButton}
          >
            <Feather name="minus" size={18} color="#d32f2f" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateQuantity(item.car.id, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <Feather name="plus" size={18} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.car.id)} style={styles.remove}>
        <Feather name="trash-2" size={20} color="#999" />
      </TouchableOpacity>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Feather name="shopping-cart" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Seu carrinho está vazio</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.continueButton}>
            <Text style={styles.continueText}>Continuar comprando</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com botão voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#d32f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Carrinho</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.car.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Subtotal e botão Avançar */}
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal:</Text>
          <Text style={styles.subtotalValue}>R$ {subtotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.nextButtonText}>Avançar</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  remove: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  nextButton: {
    backgroundColor: '#d32f2f',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  continueButton: {
    marginTop: 20,
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
  },
});