'use client';

// Page Comparaison de joueurs
// Encodage: UTF-8

import { motion } from 'framer-motion';

export default function ComparisonPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="card-glass text-center py-16">
          <div className="w-16 h-16 bg-r6-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="pi pi-arrow-right-arrow-left text-r6-primary text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-r6-light mb-4">
            Comparaison de Joueurs
          </h1>
          <p className="text-r6-light/70 mb-8 max-w-2xl mx-auto">
            Comparez les performances de plusieurs joueurs côte à côte pour analyser 
            les différences de stratégie et de performance.
          </p>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-r6-accent/20 text-r6-accent rounded-lg">
            <i className="pi pi-clock"></i>
            <span className="font-medium">Bientôt disponible</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}