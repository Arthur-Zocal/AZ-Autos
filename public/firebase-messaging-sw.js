/* global importScripts, firebase */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCjF1RyL4gJdhX-gu4LX6l9CiSzv2A7S9M",
  authDomain: "az-autos-projeto.firebaseapp.com",
  projectId: "az-autos-projeto",
  storageBucket: "az-autos-projeto.appspot.com",
  messagingSenderId: "328495756759",
  appId: "1:328495756759:web:203c2e8388ba69dbd80792",
  databaseURL: "https://az-autos-projeto-default-rtdb.firebaseio.com/"
});

const messaging = firebase.messaging();

// Background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[service-worker] Received background message ', payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, { body });
});