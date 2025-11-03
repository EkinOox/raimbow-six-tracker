'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log l'erreur dans la console pour le débogage
    console.error('Erreur capturée:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-r6-dark to-r6-dark-secondary opacity-80" />
      
      {/* Particules d'alerte */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo avec effet d'alerte */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 200, 
            damping: 15 
          }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(239, 68, 68, 0.3)',
                '0 0 40px rgba(239, 68, 68, 0.6)',
                '0 0 20px rgba(239, 68, 68, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 to-r6-primary p-2"
          >
            <Image
              src="/images/logo/r6x-logo-ww.avif"
              alt="R6 Tracker Logo"
              fill
              className="object-contain p-2 grayscale"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Icône d'alerte */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <div className="text-8xl mb-4">⚠️</div>
          <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 mx-auto mb-6 rounded-full" />
        </motion.div>

        {/* Message d'erreur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            🚨 Erreur Critique
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Une erreur inattendue s&apos;est produite. L&apos;opération a été <span className="text-red-500 font-semibold">compromise</span>.
          </p>
          <p className="text-gray-400">
            Notre équipe a été notifiée et travaille sur le problème.
          </p>
        </motion.div>

        {/* Détails de l'erreur (mode dev uniquement) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-8 p-4 bg-red-950/30 border border-red-500/30 rounded-xl backdrop-blur-sm"
          >
            <p className="text-red-400 text-sm font-mono text-left overflow-x-auto">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-gray-500 text-xs mt-2 font-mono">
                Digest: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Bouton Réessayer */}
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-r6-primary text-white font-bold text-lg rounded-xl shadow-2xl shadow-red-500/50 hover:shadow-red-500/70 transition-all duration-300 gap-2"
          >
            <span>🔄</span>
            <span>Réessayer</span>
          </motion.button>

          {/* Bouton Retour */}
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 liquid-glass liquid-glass-hover text-white font-bold text-lg rounded-xl border border-glass-border-dark/50 backdrop-blur-xl transition-all duration-300 gap-2"
            >
              <span>🏠</span>
              <span>Retour à l&apos;accueil</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Code d'erreur technique */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 space-y-2"
        >
          <p className="text-gray-500 text-sm font-mono">
            ERROR_CODE: R6_SYSTEM_ERROR
          </p>
          <p className="text-gray-600 text-xs">
            Si le problème persiste, contactez le support technique.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
