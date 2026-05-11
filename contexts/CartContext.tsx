import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car } from '../services/jsonbinService';

export interface CartItem {
  car: Car;
  quantity: number;
}

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (car: Car) => void;
  removeFromCart: (carId: string) => void;
  updateQuantity: (carId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Carregar carrinho salvo ao iniciar
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem('@cart');
        if (stored) setCartItems(JSON.parse(stored));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    };
    loadCart();
  }, []);

  // Salvar sempre que mudar
  useEffect(() => {
    AsyncStorage.setItem('@cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (car: Car) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.car.id === car.id);
      if (existing) {
        return prev.map(item =>
          item.car.id === car.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { car, quantity: 1 }];
    });
  };

  const removeFromCart = (carId: string) => {
    setCartItems(prev => prev.filter(item => item.car.id !== carId));
  };

  const updateQuantity = (carId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(carId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.car.id === carId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCartItems([]);

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getTotalPrice = () =>
    cartItems.reduce((sum, item) => sum + item.car.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};