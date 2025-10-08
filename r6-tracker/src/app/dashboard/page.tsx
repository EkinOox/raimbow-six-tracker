'use client';

// Page Dashboard - Tableau de bord
// Encodage: UTF-8

import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="card-glass text-center py-16">
          <SectionHeader
            title="Dashboard"
            description="Le tableau de bord pour analyser vos performances et visualiser vos statistiques détaillées. Cette fonctionnalité sera bientôt disponible."
            icon="pi-chart-bar"
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