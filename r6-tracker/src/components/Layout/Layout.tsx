'use client';

// Layout principal avec Navbar et animations
// Encodage: UTF-8

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../Navbar/Navbar';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

export default function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-r6-primary/5 via-transparent to-r6-accent/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-r6-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-r6-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className={`relative z-10 pt-16 ${className}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key="page-content"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-glass-bg-dark/50 backdrop-blur-sm border-t border-glass-border-dark/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo et description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative w-6 h-6 rounded overflow-hidden bg-gradient-r6 p-0.5">
                  <Image
                    src="/images/logo/r6-logo.png"
                    alt="R6 Tracker Logo"
                    width={20}
                    height={20}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-r6-light">
                  R6 <span className="text-r6-primary">Tracker</span>
                </span>
              </div>
              <p className="text-r6-light/70 text-sm">
                Suivez vos statistiques Rainbow Six Siege avec style. 
                Interface moderne et données en temps réel.
              </p>
            </div>

            {/* Liens rapides */}
            <div className="space-y-4">
              <h3 className="text-r6-light font-semibold">Liens Rapides</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/search" className="text-r6-light/70 hover:text-r6-primary transition-colors">
                    Recherche de Joueurs
                  </a>
                </li>
                <li>
                  <Link href="/operators" className="text-r6-light/70 hover:text-r6-primary transition-colors">
                    Opérateurs
                  </Link>
                </li>
                <li>
                  <a href="/maps" className="text-r6-light/70 hover:text-r6-primary transition-colors">
                    Cartes
                  </a>
                </li>
              </ul>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              <h3 className="text-r6-light font-semibold">Informations</h3>
              <div className="text-sm text-r6-light/70 space-y-2">
                <p>Version: 1.0.0</p>
                <p>Mise à jour: Octobre 2025</p>
                <p>
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>API Opérationnelle</span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-glass-border-dark/50 mt-8 pt-8 text-center">
            <p className="text-r6-light/50 text-sm">
              © 2025 R6 Tracker. Créé avec ❤️ pour la communauté Rainbow Six Siege.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}