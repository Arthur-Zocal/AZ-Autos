import { onValueCreated } from 'firebase-functions/v2/database';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendPushOnNewNotification = onValueCreated(
  {
    ref: '/notifications/{pushId}',
    region: 'southamerica-east1', // ou a região que você escolheu
  },
  async (event) => {
    const snapshot = event.data;
    const notif = snapshot.val();
    const { title, message } = notif;

    if (!title || !message) {
      console.log('Notificação sem título ou mensagem. Ignorando.');
      return;
    }

    // Busca todos os usuários
    const usersSnapshot = await admin.database().ref('/users').once('value');
    const users = usersSnapshot.val();
    if (!users) {
      console.log('Nenhum usuário encontrado.');
      return;
    }

    // Coleta tokens válidos
    const tokens: string[] = [];
    for (const uid in users) {
      const token = users[uid].pushToken;
      if (token) {
        tokens.push(token);
      }
    }

    if (tokens.length === 0) {
      console.log('Nenhum token de push disponível.');
      return;
    }

    // Monta a mensagem multicast
    const messagePayload: admin.messaging.MulticastMessage = {
      notification: {
        title: title,
        body: message,
      },
      data: {
        screen: 'products',
      },
      tokens: tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(messagePayload);
      console.log(`Sucesso: ${response.successCount}, Falhas: ${response.failureCount}`);

      // Remove tokens inválidos
      const tokensToRemove: { [path: string]: null } = {};
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            for (const uid in users) {
              if (users[uid].pushToken === tokens[idx]) {
                tokensToRemove[uid + '/pushToken'] = null;
                break;
              }
            }
          }
        }
      });

      if (Object.keys(tokensToRemove).length > 0) {
        await admin.database().ref('/users').update(tokensToRemove);
        console.log('Tokens inválidos removidos.');
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
    }
  }
);