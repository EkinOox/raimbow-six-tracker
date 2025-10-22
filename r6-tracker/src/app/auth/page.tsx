'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store';
import { register, login, clearError } from '../../store/slices/authSlice';

export default function AuthPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    uplayProfile: '',
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard-new');
    }
  }, [isAuthenticated, user, router]);

  // Nettoyer les erreurs au changement de mode
  useEffect(() => {
    dispatch(clearError());
  }, [isLogin, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (isLogin) {
      // Connexion
      dispatch(login({
        email: formData.email,
        password: formData.password,
      }));
    } else {
      // Inscription
      if (formData.password !== formData.confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (formData.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      dispatch(register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        uplayProfile: formData.uplayProfile || undefined,
      }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      uplayProfile: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            R6 <span className="text-orange-500">Tracker</span>
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Connectez-vous pour accéder à vos favoris' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                !isLogin
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="username"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom d&apos;utilisateur *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="PlayerOne"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <>
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </motion.div>

                  <motion.div
                    key="uplayProfile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profil Uplay <span className="text-gray-500">(optionnel)</span>
                    </label>
                    <input
                      type="text"
                      name="uplayProfile"
                      value={formData.uplayProfile}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="VotreNomUplay"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Votre profil Uplay permet d&apos;afficher vos statistiques personnelles sur le dashboard
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="pi pi-spin pi-spinner mr-2"></i>
                  Chargement...
                </span>
              ) : (
                isLogin ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
            >
              {isLogin ? (
                <>
                  Pas encore de compte ?{' '}
                  <span className="font-medium text-orange-400">Inscrivez-vous</span>
                </>
              ) : (
                <>
                  Déjà un compte ?{' '}
                  <span className="font-medium text-orange-400">Connectez-vous</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            En vous inscrivant, vous pourrez sauvegarder vos opérateurs, armes et maps favoris
          </p>
        </div>
      </motion.div>
    </div>
  );
}
