'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  uplayProfile: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    username: '',
    avatar: '',
    uplayProfile: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUserProfile = async () => {
    try {
      if (!isAuthenticated) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/auth/me');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth');
          return;
        }
        throw new Error('Erreur lors de la récupération du profil');
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        username: data.user.username,
        avatar: data.user.avatar || '',
        uplayProfile: data.user.uplayProfile || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      if (!isAuthenticated) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Gérer les erreurs spécifiques
        if (response.status === 409) {
          // Conflit - déterminer quel champ est en erreur
          if (data.message.includes('Uplay') || data.message.includes('profil Uplay')) {
            setFieldErrors({ uplayProfile: data.message });
          } else if (data.message.includes('nom d\'utilisateur') || data.message.includes('username')) {
            setFieldErrors({ username: data.message });
          } else {
            setError(data.message);
          }
        } else {
          setError(data.message || 'Erreur lors de la mise à jour du profil');
        }
        return;
      }

      setUser(data.user);
      setSuccess('Profil mis à jour avec succès !');
      setIsEditing(false);
      
      // Rafraîchir automatiquement après 2 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        avatar: user.avatar || '',
        uplayProfile: user.uplayProfile || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-r6-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-r6-light text-xl font-semibold">Chargement du profil...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* En-tête avec effet glassmorphisme */}
        <div className="mb-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-r6-light mb-2"
          >
            <i className="pi pi-user-edit text-r6-primary mr-3"></i>
            Mon Profil
          </motion.h1>
          <p className="text-r6-light/60">Gérez vos informations personnelles et votre profil Uplay</p>
        </div>

        <div className="bg-glass-bg-dark/80 backdrop-blur-glass shadow-glass rounded-2xl overflow-hidden border border-glass-border-dark">
          {/* Header avec gradient */}
          <div className="relative bg-gradient-r6 px-8 py-12 overflow-hidden">
            {/* Effet de particules animées */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative flex items-center space-x-6">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-glass-bg-dark/50 backdrop-blur-md flex items-center justify-center text-5xl sm:text-6xl font-bold text-white shadow-glass border-2 border-white/20"
              >
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt={user.username} 
                    width={128} 
                    height={128} 
                    className="w-full h-full rounded-2xl object-cover" 
                  />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </motion.div>

              <div className="flex-1">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{user.username}</h2>
                <p className="text-white/80 text-lg mb-1">{user.email}</p>
                {user.uplayProfile && (
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                    <i className="pi pi-id-card text-white text-sm"></i>
                    <span className="text-white font-medium text-sm">Uplay: {user.uplayProfile}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages de feedback */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-8 mt-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start space-x-3"
              >
                <i className="pi pi-exclamation-circle text-xl flex-shrink-0"></i>
                <div className="flex-1">
                  <p className="font-semibold">Erreur</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-8 mt-6 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg flex items-start space-x-3"
              >
                <i className="pi pi-check-circle text-xl flex-shrink-0"></i>
                <div className="flex-1">
                  <p className="font-semibold">Succès</p>
                  <p className="text-sm">{success}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <div className="px-8 py-8">
            <div className="space-y-6">
              {/* Nom d'utilisateur */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="text-sm font-semibold text-r6-light mb-2 flex items-center space-x-2">
                  <i className="pi pi-user text-r6-primary"></i>
                  <span>Nom d&apos;utilisateur</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                        if (fieldErrors.username) {
                          setFieldErrors({ ...fieldErrors, username: '' });
                        }
                      }}
                      className={`w-full px-4 py-3 bg-glass-bg/50 backdrop-blur-md border ${
                        fieldErrors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-glass-border-dark focus:border-r6-primary focus:ring-r6-primary/20'
                      } rounded-lg text-r6-light placeholder-r6-light/40 focus:outline-none focus:ring-2 transition-all`}
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[a-zA-Z0-9_-]+"
                      title="Seuls les lettres, chiffres, tirets et underscores sont autorisés"
                      placeholder="VotreNomUtilisateur"
                    />
                    {fieldErrors.username && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg flex items-start space-x-2 text-sm"
                      >
                        <i className="pi pi-exclamation-circle flex-shrink-0 mt-0.5"></i>
                        <span>{fieldErrors.username}</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3 bg-glass-bg/30 border border-glass-border-dark rounded-lg">
                    <p className="text-r6-light text-lg font-medium">{user.username}</p>
                  </div>
                )}
                {isEditing && !fieldErrors.username && (
                  <p className="mt-2 text-xs text-r6-light/50">
                    <i className="pi pi-info-circle mr-1"></i>
                    3-30 caractères, lettres, chiffres, tirets et underscores uniquement
                  </p>
                )}
              </motion.div>

              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="text-sm font-semibold text-r6-light mb-2 flex items-center space-x-2">
                  <i className="pi pi-image text-r6-primary"></i>
                  <span>Avatar (URL)</span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="w-full px-4 py-3 bg-glass-bg/50 backdrop-blur-md border border-glass-border-dark rounded-lg text-r6-light placeholder-r6-light/40 focus:outline-none focus:border-r6-primary focus:ring-2 focus:ring-r6-primary/20 transition-all"
                    placeholder="https://exemple.com/avatar.jpg"
                  />
                ) : (
                  <div className="px-4 py-3 bg-glass-bg/30 border border-glass-border-dark rounded-lg">
                    <p className="text-r6-light text-lg font-medium break-all">
                      {user.avatar || <span className="text-r6-light/50">Non défini</span>}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Profil Uplay */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="pb-6 border-b border-glass-border-dark"
              >
                <label className="text-sm font-semibold text-r6-light mb-2 flex items-center space-x-2">
                  <i className="pi pi-id-card text-r6-primary"></i>
                  <span>Profil Uplay</span>
                </label>
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={formData.uplayProfile}
                      onChange={(e) => {
                        setFormData({ ...formData, uplayProfile: e.target.value });
                        if (fieldErrors.uplayProfile) {
                          setFieldErrors({ ...fieldErrors, uplayProfile: '' });
                        }
                      }}
                      className={`w-full px-4 py-3 bg-glass-bg/50 backdrop-blur-md border ${
                        fieldErrors.uplayProfile ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-glass-border-dark focus:border-r6-primary focus:ring-r6-primary/20'
                      } rounded-lg text-r6-light placeholder-r6-light/40 focus:outline-none focus:ring-2 transition-all`}
                      placeholder="VotreNomUplay"
                    />
                    {fieldErrors.uplayProfile ? (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-start space-x-3"
                      >
                        <i className="pi pi-exclamation-triangle text-xl flex-shrink-0"></i>
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Profil Uplay déjà utilisé</p>
                          <p>{fieldErrors.uplayProfile}</p>
                          <p className="mt-2 text-red-300">Veuillez choisir votre propre profil Uplay ou un profil différent.</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="mt-3 bg-orange-500/10 border border-orange-500/50 text-orange-400 px-4 py-3 rounded-lg flex items-start space-x-3">
                        <i className="pi pi-exclamation-triangle text-xl flex-shrink-0"></i>
                        <div className="text-sm">
                          <p className="font-semibold mb-1">Important</p>
                          <p>Ce profil Uplay doit être unique. Il ne peut pas être utilisé par un autre joueur inscrit sur la plateforme.</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3 bg-glass-bg/30 border border-glass-border-dark rounded-lg">
                    <p className="text-r6-light text-lg font-medium">
                      {user.uplayProfile || <span className="text-r6-light/50">Non défini</span>}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Informations du compte */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
              >
                <div>
                  <label className="text-sm font-semibold text-r6-light/70 mb-2 flex items-center space-x-2">
                    <i className="pi pi-calendar text-r6-primary/70"></i>
                    <span>Compte créé le</span>
                  </label>
                  <div className="px-4 py-3 bg-glass-bg/20 border border-glass-border-dark/50 rounded-lg">
                    <p className="text-r6-light font-medium">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-r6-light/70 mb-2 flex items-center space-x-2">
                    <i className="pi pi-clock text-r6-primary/70"></i>
                    <span>Dernière mise à jour</span>
                  </label>
                  <div className="px-4 py-3 bg-glass-bg/20 border border-glass-border-dark/50 rounded-lg">
                    <p className="text-r6-light font-medium">
                      {new Date(user.updatedAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Boutons d'action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              {isEditing ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-r6 hover:shadow-lg hover:shadow-r6-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <i className="pi pi-check"></i>
                        <span>Enregistrer les modifications</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex-1 bg-glass-bg hover:bg-glass-bg/80 disabled:opacity-50 disabled:cursor-not-allowed text-r6-light font-bold py-4 px-6 rounded-lg border border-glass-border-dark hover:border-r6-light/30 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <i className="pi pi-times"></i>
                    <span>Annuler</span>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-r6 hover:shadow-lg hover:shadow-r6-primary/30 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <i className="pi pi-pencil"></i>
                  <span>Modifier mon profil</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Actions supplémentaires */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push('/dashboard-new')}
            className="bg-glass-bg-dark/50 backdrop-blur-md border border-glass-border-dark hover:border-r6-primary text-r6-light hover:text-r6-primary py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3"
          >
            <i className="pi pi-chart-bar text-xl"></i>
            <span className="font-semibold">Ma Dashboard</span>
          </button>
          {user.uplayProfile && (
            <button
              onClick={() => router.push(`/profile/${user.uplayProfile}`)}
              className="bg-glass-bg-dark/50 backdrop-blur-md border border-glass-border-dark hover:border-r6-primary text-r6-light hover:text-r6-primary py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3"
            >
              <i className="pi pi-id-card text-xl"></i>
              <span className="font-semibold">Voir mon Profil R6</span>
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
