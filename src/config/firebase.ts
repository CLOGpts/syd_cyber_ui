import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
const validateConfig = (): void => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingKeys = requiredKeys.filter(
    key => !import.meta.env[key]
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase configuration error: Missing environment variables: ${missingKeys.join(', ')}`
    );
  }
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  validateConfig();
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  console.log('[Firebase] Initialized successfully', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
} catch (error) {
  console.error('[Firebase] Initialization error:', error);
  throw error;
}

export { auth, db };
export default app;
