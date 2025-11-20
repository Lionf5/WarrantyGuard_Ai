import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// IMPORTANT: YOU MUST REPLACE THESE VALUES WITH YOUR OWN FIREBASE CONFIGURATION
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Go to Project Settings > General > Your apps > Add app (Web)
// 4. Copy the 'firebaseConfig' object below
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const firebaseConfig = {
  // Replace with your API Key
  apiKey: "YOUR_API_KEY_HERE",
  
  // Replace with your Auth Domain (project-id.firebaseapp.com)
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  
  // Replace with your Project ID
  projectId: "YOUR_PROJECT_ID",
  
  // Replace with your Storage Bucket
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  
  // Replace with your Messaging Sender ID
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  
  // Replace with your App ID
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
// We use a try-catch block to handle cases where config is missing during dev
let app;
let auth;
let db;
let googleProvider;
let facebookProvider;

try {
    // Check if config is still the placeholder
    if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
        console.warn("⚠️ Firebase is using placeholder keys. Please update services/firebase.ts");
    }

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Providers
    googleProvider = new GoogleAuthProvider();
    
    facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');
    facebookProvider.addScope('public_profile');

} catch (error) {
    console.warn("Firebase initialization failed. Check your configuration.", error);
}

export { auth, db, googleProvider, facebookProvider };