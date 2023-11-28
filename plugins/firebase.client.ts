// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const firebaseConfig = {
    apiKey: config.firebase.apiKey,
    authDomain: config.firebase.authDomain,
    projectId: config.firebase.projectId,
    storageBucket: config.firebase.storageBucket,
    messagingSenderId: config.firebase.messagingSenderId,
    appId: config.firebase.appId,
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const messaging = getMessaging(app);

  const firebase = {
    app,
    auth,
    messaging,
  };
  nuxtApp.provide("firebase", firebase);
  nuxtApp.vueApp.provide("firebase", firebase);
});
