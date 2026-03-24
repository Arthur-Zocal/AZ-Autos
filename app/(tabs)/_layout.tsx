import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Rodapé do app

export default function TabLayout() {
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
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color }) => <Feather name="shopping-bag" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Sobre',
          tabBarIcon: ({ color }) => <Feather name="info" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="addCar"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => <Feather name="plus-circle" size={24} color={color} />,
          href: null, // Não aparece no rodapé
        }}
      />
      <Tabs.Screen
        name="editCar"
        options={{
          href: null, // Não aparece no rodapé
        }}
      />
    </Tabs>
  );
}