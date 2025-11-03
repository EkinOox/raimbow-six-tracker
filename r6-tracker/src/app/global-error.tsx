'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur globale capturée:', error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-gradient-to-br from-red-900/20 via-r6-dark to-r6-dark-secondary text-white">
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
          {/* Particules d'alerte critique */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-red-600 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Icône d'erreur critique */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 200, 
                damping: 15 
              }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="text-9xl mb-4"
              >
                🔥
              </motion.div>
            </motion.div>

            {/* Message d'erreur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 space-y-4"
            >
              <h1 className="text-5xl font-bold text-white mb-4">
                Erreur Système Critique
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-2">
                Une erreur système majeure s&apos;est produite.
              </p>
              <p className="text-lg text-red-400 font-semibold">
                Tous les systèmes sont en mode d&apos;urgence.
              </p>
            </motion.div>

            {/* Détails de l'erreur */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mb-8 p-6 bg-red-950/50 border-2 border-red-500/50 rounded-xl backdrop-blur-sm"
              >
                <h3 className="text-red-400 font-bold mb-3 text-left">Détails Techniques:</h3>
                <p className="text-red-300 text-sm font-mono text-left overflow-x-auto break-words">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-gray-400 text-xs mt-3 font-mono text-left">
                    Error Digest: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-4 text-left">
                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                      Stack Trace
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-x-auto p-3 bg-black/30 rounded">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-4"
            >
              <motion.button
                onClick={reset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-red-600 via-r6-primary to-orange-600 text-white font-bold text-xl rounded-xl shadow-2xl shadow-red-500/50 hover:shadow-red-500/80 transition-all duration-300 gap-3"
              >
                <span className="text-2xl">🔄</span>
                <span>Redémarrer l&apos;application</span>
              </motion.button>

              <p className="text-gray-400 text-sm">
                ou rechargez la page manuellement (Ctrl+R / Cmd+R)
              </p>
            </motion.div>

            {/* Code d'erreur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 p-4 border border-red-500/30 rounded-lg bg-red-950/20"
            >
              <p className="text-red-500 font-bold text-sm mb-2">
                🚨 ALERTE SYSTÈME CRITIQUE
              </p>
              <p className="text-gray-500 text-xs font-mono">
                ERROR_CODE: R6_GLOBAL_SYSTEM_FAILURE
              </p>
              {error.digest && (
                <p className="text-gray-600 text-xs font-mono mt-1">
                  DIGEST: {error.digest}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  );
}
