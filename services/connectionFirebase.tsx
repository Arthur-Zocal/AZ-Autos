import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCjF1RyL4gJdhX-gu4LX6l9CiSzv2A7S9M",
  authDomain: "az-autos-projeto.firebaseapp.com",
  projectId: "az-autos-projeto",
  storageBucket: "az-autos-projeto.firebasestorage.app",
  messagingSenderId: "328495756759",
  appId: "1:328495756759:web:203c2e8388ba69dbd80792",
  databaseURL: "https://az-autos-projeto-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Pra não voltar logado com a conta quando inicar o app
/* 
  setPersistence(auth, inMemoryPersistence)
    .then(() => {
      console.log(' Persistência configurada: em memória');
    })
    .catch((error) => {
      console.error('Erro ao configurar persistência:', error);
    });

  */

// Teste de conexão
console.log('🔥 Firebase inicializado');
console.log('Database URL:', database.app.options.databaseURL);

export { auth, database, storage };