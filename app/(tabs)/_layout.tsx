import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAdmin } from '../../hooks/useAdmin';
import { View, ActivityIndicator } from 'react-native';

function TabLayoutContent() {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#d32f2f" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d32f2f',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 68,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{ title: 'Produtos', tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="about"
        options={{ title: 'Sobre', tabBarIcon: ({ color }) => <Feather name="info" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'Management',
          tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
          href: isAdmin ? undefined : null,  
        }}
      />

      {/* Rotas ocultas */}
      <Tabs.Screen name="addCar" options={{ href: null }} />
      <Tabs.Screen name="editCar" options={{ href: null }} />
      <Tabs.Screen name="manageNotifications" options={{ href: null }} />
      <Tabs.Screen name="manageCoupons" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return <TabLayoutContent />;
}