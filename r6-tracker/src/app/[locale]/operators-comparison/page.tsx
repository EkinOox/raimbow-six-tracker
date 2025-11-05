'use client';

// Page de comparaison d'opérateurs
// Encodage: UTF-8

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useOperators } from '@/hooks/useR6Data';
import SectionHeader from '@/components/ui/SectionHeader';
import OperatorComparison from '@/components/OperatorComparison';

export default function OperatorsComparisonPage() {
  const { operators, loading, error, loadOperators } = useOperators();

  useEffect(() => {
    if (!operators || operators.length === 0) {
      loadOperators();
    }
  }, [operators, loadOperators]);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* En-tête */}
        <SectionHeader
          title="Comparaison d'Opérateurs"
          description="Comparez deux opérateurs côte à côte pour analyser leurs forces et faiblesses."
          icon="pi-users"
          useLogo={true}
        />

        {/* Bouton retour */}
        <Link
          href="/operators"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <i className="pi pi-arrow-left"></i>
          <span>Retour aux opérateurs</span>
        </Link>

        {/* Affichage d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-8"
          >
            <div className="flex items-center space-x-2 text-red-400">
              <i className="pi pi-exclamation-triangle"></i>
              <span className="font-medium">Erreur de chargement</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (!operators || operators.length === 0) && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-white/70">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Chargement des opérateurs...</span>
            </div>
          </div>
        )}

        {/* Comparateur */}
        {!loading && operators && operators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <OperatorComparison operators={operators} />
          </motion.div>
        )}

        {/* Conseils d'utilisation */}
        {!loading && operators && operators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <i className="pi pi-lightbulb mr-3 text-yellow-400"></i>
              Conseils pour comparer efficacement
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <i className="pi pi-check text-green-400 mr-2"></i>
                  Pour la composition d&apos;équipe
                </h4>
                <ul className="space-y-1 text-white/80 text-sm">
                  <li>• Comparez des opérateurs du même côté (ATK ou DEF)</li>
                  <li>• Analysez la complémentarité des rôles</li>
                  <li>• Équilibrez vitesse et armure dans votre équipe</li>
                  <li>• Considérez les synergies de capacités</li>
                </ul>
              </div>

              <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-semibold mb-2 flex items-center">
                  <i className="pi pi-shield text-blue-400 mr-2"></i>
                  Pour le contre-jeu
                </h4>
                <ul className="space-y-1 text-white/80 text-sm">
                  <li>• Comparez des opérateurs de côtés opposés</li>
                  <li>• Identifiez les forces à contrer</li>
                  <li>• Analysez les matchups défavorables</li>
                  <li>• Préparez vos stratégies de contre</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
