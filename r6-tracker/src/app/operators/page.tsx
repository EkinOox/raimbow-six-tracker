'use client';

// Page Opérateurs
// Encodage: UTF-8

import { motion } from 'framer-motion';
import SectionHeader from '../../components/ui/SectionHeader';

const operators = [
  { name: 'Ash', type: 'Attaquant', icon: 'pi-bolt' },
  { name: 'Thermite', type: 'Attaquant', icon: 'pi-fire' },
  { name: 'Twitch', type: 'Attaquant', icon: 'pi-desktop' },
  { name: 'Hibana', type: 'Attaquant', icon: 'pi-star' },
  { name: 'Jäger', type: 'Défenseur', icon: 'pi-shield' },
  { name: 'Bandit', type: 'Défenseur', icon: 'pi-bolt' },
  { name: 'Valkyrie', type: 'Défenseur', icon: 'pi-eye' },
  { name: 'Caveira', type: 'Défenseur', icon: 'pi-moon' },
];

export default function OperatorsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* En-tête */}
        <SectionHeader
          title="Opérateurs"
          description="Découvrez les statistiques détaillées par opérateur et optimisez votre gameplay avec les meilleurs personnages pour votre style de jeu."
          icon="pi-users"
          useLogo={true}
        />

        {/* Grille des opérateurs en preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {operators.map((operator, index) => (
            <motion.div
              key={operator.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="card-glass text-center group cursor-pointer"
            >
              <div className="w-12 h-12 bg-r6-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-r6-primary/30 transition-colors">
                <i className={`pi ${operator.icon} text-r6-primary text-xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-r6-light mb-1">
                {operator.name}
              </h3>
              <p className="text-sm text-r6-light/60">
                {operator.type}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Message de développement */}
        <div className="card-glass text-center py-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-r6-accent/20 text-r6-accent rounded-lg mb-6">
            <i className="pi pi-clock"></i>
            <span className="font-medium">En développement</span>
          </div>
          <h2 className="text-2xl font-semibold text-r6-light mb-4">
            Statistiques par Opérateur
          </h2>
          <p className="text-r6-light/70 max-w-2xl mx-auto">
            Les statistiques détaillées par opérateur, incluant le temps de jeu, 
            K/D ratio, taux de victoire et gadgets utilisés seront bientôt disponibles.
          </p>
        </div>
      </motion.div>
    </div>
  );
}