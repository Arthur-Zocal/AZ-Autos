import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Oculta cabeçalho em todas as telas
      }}
    />
  );
}