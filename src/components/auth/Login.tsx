import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, AlertCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';

interface LoginProps {
  onLogin: (username: string, userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { user, loading, error, login, clearError } = useFirebaseAuth();

  // When user is authenticated, trigger onLogin
  useEffect(() => {
    if (user && !loading) {
      console.log('[Login] User authenticated, triggering onLogin:', {
        uid: user.uid,
        email: user.email
      });

      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
      onLogin(displayName, user.uid);
    }
  }, [user, loading, onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim()) {
      setLocalError('Inserisci un indirizzo email');
      return;
    }

    if (!password.trim()) {
      setLocalError('Inserisci la password');
      return;
    }

    try {
      await login(email, password);
      // onLogin will be called by useEffect when user state updates
    } catch (err) {
      // Error is already set in useFirebaseAuth
      console.error('[Login] Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl shadow-2xl mb-4"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">SYD Cyber</h1>
          <p className="text-blue-200">Sistema di Analisi del Rischio Cyber</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Accesso Sicuro</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="esempio@dominio.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="Inserisci password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-400/30"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error || localError}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accedi</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200">
              Ambiente di test sicuro
            </p>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center space-x-2 text-blue-200 text-sm">
            <Shield className="h-4 w-4" />
            <span>Connessione sicura e crittografata</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;