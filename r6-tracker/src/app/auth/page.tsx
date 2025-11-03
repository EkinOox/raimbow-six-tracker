'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    uplayProfile: '',
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard-new');
    }
  }, [isAuthenticated, router]);

  // Nettoyer les erreurs au changement de mode
  useEffect(() => {
    setError('');
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // Connexion avec NextAuth
      try {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          // Messages d'erreur simples et clairs
          setError('Email ou mot de passe incorrect');
        } else if (result?.ok) {
          router.push('/dashboard-new');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Inscription via API puis connexion
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Mot de passe trop court (minimum 6 caractères)');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            uplayProfile: formData.uplayProfile || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Messages d'erreur simplifiés
          if (response.status === 409 || data.error?.includes('existe')) {
            setError('Un compte existe déjà avec cet email');
          } else if (data.error?.includes('email')) {
            setError('Email invalide');
          } else if (data.error?.includes('username')) {
            setError('Nom d\'utilisateur invalide');
          } else {
            setError('Erreur lors de l\'inscription');
          }
        } else {
          // Connexion automatique après inscription réussie
          const signInResult = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (signInResult?.ok) {
            router.push('/dashboard-new');
          } else {
            setError('Compte créé mais erreur de connexion automatique');
          }
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
        console.error(err);
      } finally {
        setLoading(false);
      }
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
          <div className="flex gap-4 mb-6" role="tablist" aria-label="Mode d'authentification">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                isLogin
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
              role="tab"
              aria-selected={isLogin}
              aria-controls="auth-panel"
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
              role="tab"
              aria-selected={!isLogin}
              aria-controls="auth-panel"
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
                <div className="flex items-start space-x-3">
                  <i className="pi pi-exclamation-circle text-red-400 text-lg mt-0.5"></i>
                  <p className="text-red-300 text-sm flex-1">{error}</p>
                </div>
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'} text-lg`}></i>
                </button>
              </div>
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
