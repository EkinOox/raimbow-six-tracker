'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-r6-dark via-r6-dark-secondary to-r6-dark opacity-50" />
      
      {/* Particules en arrière-plan */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-r6-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo animé */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            duration: 0.8 
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gradient-r6 p-2 shadow-2xl shadow-r6-primary/50">
            <Image
              src="/images/logo/r6x-logo-ww.avif"
              alt="R6 Tracker Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>
        </motion.div>

        {/* Code d'erreur 404 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-r6-primary via-orange-500 to-r6-accent bg-clip-text text-transparent mb-4">
            404
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-r6-primary to-r6-accent mx-auto mb-6 rounded-full" />
        </motion.div>

        {/* Message d'erreur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            🎯 Objectif non trouvé
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            La page que vous recherchez a été <span className="text-r6-primary font-semibold">neutralisée</span> ou n&apos;existe pas.
          </p>
          <p className="text-gray-400">
            Peut-être que cette route a été <span className="text-r6-accent">renforcée</span> ou déplacée vers une nouvelle position.
          </p>
        </motion.div>

        {/* Cartes d'actions avec effet liquid glass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { href: '/', icon: '🏠', label: 'Accueil', desc: 'Retour à la base' },
            { href: '/operators', icon: '🎮', label: 'Opérateurs', desc: 'Liste complète' },
            { href: '/search', icon: '🔍', label: 'Recherche', desc: 'Trouver un joueur' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="liquid-glass liquid-glass-hover p-6 rounded-xl border border-glass-border-dark/50 backdrop-blur-xl"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-r6-accent transition-colors">
                  {item.label}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Bouton principal de retour */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-r6 text-white font-bold text-lg rounded-xl shadow-2xl shadow-r6-primary/50 hover:shadow-r6-primary/70 transition-all duration-300 gap-2"
            >
              <span>←</span>
              <span>Retour au QG</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Code d'erreur technique */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-gray-500 text-sm font-mono"
        >
          ERROR_CODE: R6_404_ROUTE_NOT_FOUND
        </motion.div>
      </div>
    </div>
  );
}
