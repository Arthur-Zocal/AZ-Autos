import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { View, ActivityIndicator, Platform } from 'react-native';
import { registerForPushNotifications } from '../services/notificationService';
import { database } from '../services/connectionFirebase';
import { ref, onChildAdded } from 'firebase/database';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (user && Platform.OS === 'web') {
      console.log('Usuário logado, registrando para notificações...');
      registerForPushNotifications(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (!user || Platform.OS !== 'web') return;

    console.log(' Listener configurado! Aguardando novas notificações...');
    const notifRef = ref(database, 'notifications');

    const unsubscribe = onChildAdded(notifRef, (snapshot) => {
      console.log('🟢 Notificação recebida:', snapshot.key, snapshot.val());
      const data = snapshot.val();
      if (data && Notification.permission === 'granted') {
        new Notification(data.title, { body: data.message });
        console.log(' Notificação exibida no navegador');
      }
    });

    return () => {
      console.log('🧹 Listener desmontado');
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isAtRoot = !segments[0];

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && isAtRoot) {
      router.replace('/(tabs)/products');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}