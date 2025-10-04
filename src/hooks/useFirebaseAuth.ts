import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthHook extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Firebase error messages in Italian
const getErrorMessage = (error: AuthError): string => {
  console.error('[Firebase Auth] Error:', error.code, error.message);

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Email non valida';
    case 'auth/user-disabled':
      return 'Utente disabilitato';
    case 'auth/user-not-found':
      return 'Utente non trovato';
    case 'auth/wrong-password':
      return 'Password non corretta';
    case 'auth/invalid-credential':
      return 'Credenziali non valide';
    case 'auth/too-many-requests':
      return 'Troppi tentativi. Riprova più tardi';
    case 'auth/network-request-failed':
      return 'Errore di connessione. Verifica la rete';
    case 'auth/popup-blocked':
      return 'Popup bloccato dal browser';
    case 'auth/operation-not-allowed':
      return 'Operazione non consentita';
    default:
      return 'Errore di autenticazione. Riprova';
  }
};

export const useFirebaseAuth = (): AuthHook => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Auth state observer
  useEffect(() => {
    console.log('[Firebase Auth] Setting up auth observer');

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('[Firebase Auth] State changed:', user ? {
          uid: user.uid,
          email: user.email
        } : 'No user');

        setAuthState({
          user,
          loading: false,
          error: null
        });
      },
      (error) => {
        console.error('[Firebase Auth] Observer error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Errore di autenticazione'
        });
      }
    );

    return () => {
      console.log('[Firebase Auth] Cleaning up auth observer');
      unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('[Firebase Auth] Login attempt:', email);
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      console.log('[Firebase Auth] Login successful:', {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });

      setAuthState({
        user: userCredential.user,
        loading: false,
        error: null
      });
    } catch (error) {
      const authError = error as AuthError;
      const errorMessage = getErrorMessage(authError);

      setAuthState({
        user: null,
        loading: false,
        error: errorMessage
      });

      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('[Firebase Auth] Logout attempt');
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      await signOut(auth);

      console.log('[Firebase Auth] Logout successful');

      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('[Firebase Auth] Logout error:', error);

      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Errore durante il logout'
      }));

      throw error;
    }
  };

  // Clear error
  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    ...authState,
    login,
    logout,
    clearError
  };
};
