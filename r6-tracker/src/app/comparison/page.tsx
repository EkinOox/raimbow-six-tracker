'use client';

// Page Comparaison de joueurs
// Encodage: UTF-8

import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';

export default function ComparisonPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="card-glass text-center py-16">
          <SectionHeader
            title="Comparaison de Joueurs"
            description="Comparez les performances de plusieurs joueurs côte à côte pour analyser les différences de stratégie et de performance."
            icon="pi-arrow-right-arrow-left"
            useLogo={true}
            className="mb-8"
          />
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-r6-accent/20 text-r6-accent rounded-lg">
            <i className="pi pi-clock"></i>
            <span className="font-medium">Bientôt disponible</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}