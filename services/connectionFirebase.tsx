import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCjF1RyL4gJdhX-gu4LX6l9CiSzv2A7S9M",
  authDomain: "az-autos-projeto.firebaseapp.com",
  projectId: "az-autos-projeto",
  storageBucket: "az-autos-projeto.appspot.com",
  messagingSenderId: "328495756759",
  appId: "1:328495756759:web:203c2e8388ba69dbd80792",
  databaseURL: "https://az-autos-projeto-default-rtdb.firebaseio.com/"
};

// Previne inicialização duplicada
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

console.log('✅ Firebase configurado');
console.log('📦 Storage bucket:', storage.app.options.storageBucket);

export { auth, database, storage };