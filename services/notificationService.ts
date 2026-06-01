import { database } from './connectionFirebase';
import { ref, set } from 'firebase/database';
import { Platform } from 'react-native';

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS !== 'web') return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permissão de notificação negada');
      return;
    }

    // Salva um indicador de que o usuário aceitou notificações (ou o próprio UID)
    const tokenRef = ref(database, `users/${userId}/pushToken`);
    await set(tokenRef, 'web_'+userId);  // token fictício, só para indicar que está ativo

    console.log('Usuário registrado para notificações web.');
  } catch (error) {
    console.error('Erro ao registrar notificações:', error);
  }
}