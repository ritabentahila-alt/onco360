// Chimio HGC – connexion à Firebase (partagée par toutes les pages)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDboVshmUV7yLkP4Ddw_pmPlxWaMgA0oVI",
  authDomain: "chimio-hgc.firebaseapp.com",
  projectId: "chimio-hgc",
  storageBucket: "chimio-hgc.firebasestorage.app",
  messagingSenderId: "1041205165003",
  appId: "1:1041205165003:web:d92a9273c1fdbd0746544e"
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = "fr";
export const db = getFirestore(app);
export const PROPRIETAIRE = "ritabentahila@gmail.com";
// Identifiant (public) du client Google « Onco360 » pour « Lier mon Google Agenda » (Google Cloud › Identifiants)
export const GOOGLE_CLIENT_ID = "1041205165003-pmp33pf470djtcf0ugbt11uk86mkf8pf.apps.googleusercontent.com";
