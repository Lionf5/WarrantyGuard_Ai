import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


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

// Check if the config uses placeholders
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let app;
let auth;
let db;
let googleProvider;
let facebookProvider;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Providers
    googleProvider = new GoogleAuthProvider();
    
    facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');
    facebookProvider.addScope('public_profile');

  } catch (error) {
    console.error("Firebase initialization failed. Check your configuration.", error);
  }
} else {
  console.warn("Firebase is not configured. Using placeholder keys.");
}

export { auth, db, googleProvider, facebookProvider, isConfigured };