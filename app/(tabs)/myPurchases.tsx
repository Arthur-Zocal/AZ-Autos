import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { database } from '../../services/connectionFirebase';
import { ref, onValue } from 'firebase/database';

interface Purchase {
  id: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: string;
  items: {
    name: string;
    model: string;
    price: number;
    quantity: number;
  }[];
  address: {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  shippingType: string;
}

export default function MyPurchasesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    const comprasRef = ref(database, `compras/${user.uid}`);
    const unsubscribe = onValue(comprasRef, (snapshot) => {
      const data = snapshot.val();
      const list: Purchase[] = [];
      if (data) {
        Object.entries(data).forEach(([key, value]: any) => {
          list.push({
            id: key,
            ...value,
          });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setPurchases(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const renderItem = ({ item }: { item: Purchase }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleString('pt-BR')}
        </Text>
        <Text style={styles.orderTotal}>
          R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>
      <Text style={styles.address}>
        {item.address.logradouro}, {item.address.bairro} - {item.address.cidade}/{item.address.uf}
      </Text>
      <Text style={styles.shipping}>
        Frete {item.shippingType === 'expresso' ? 'Expresso' : 'Normal'}: R$ {item.shipping.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Text>
      {item.discount > 0 && (
        <Text style={styles.discount}>
          Desconto: -R$ {item.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      )}
      <View style={styles.itemsList}>
        {item.items.map((product, idx) => (
          <Text key={idx} style={styles.item}>
            {product.quantity}x {product.name} {product.model} - R$ {(product.price * product.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#d32f2f" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Compras</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={purchases}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma compra encontrada.</Text>
          </View>
        }
      />
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
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  shipping: {
    fontSize: 13,
    color: '#666',
  },
  discount: {
    fontSize: 13,
    color: '#2e7d32',
    marginTop: 2,
  },
  itemsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  item: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});