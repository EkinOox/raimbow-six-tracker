'use client';

// Page Cartes
// Encodage: UTF-8

import { motion } from 'framer-motion';

const maps = [
  { name: 'Clubhouse', type: 'Classique', icon: 'pi-home' },
  { name: 'Oregon', type: 'Classique', icon: 'pi-building' },
  { name: 'Consulate', type: 'Classique', icon: 'pi-flag' },
  { name: 'Bank', type: 'Classique', icon: 'pi-money-bill' },
  { name: 'Border', type: 'Classique', icon: 'pi-map-marker' },
  { name: 'Villa', type: 'Moderne', icon: 'pi-home' },
  { name: 'Kafe', type: 'Classique', icon: 'pi-coffee' },
  { name: 'Coastline', type: 'Moderne', icon: 'pi-globe' },
];

export default function MapsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-r6 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="pi pi-map text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-r6-light mb-4">
            Cartes
          </h1>
          <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
            Analysez vos performances sur chaque carte de Rainbow Six Siege. 
            Identifiez vos points forts et améliorez votre maîtrise des maps.
          </p>
        </div>

        {/* Grille des cartes en preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {maps.map((map, index) => (
            <motion.div
              key={map.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="card-glass text-center group cursor-pointer"
            >
              <div className="w-12 h-12 bg-r6-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-r6-primary/30 transition-colors">
                <i className={`pi ${map.icon} text-r6-primary text-xl`}></i>
              </div>
              <h3 className="text-lg font-semibold text-r6-light mb-1">
                {map.name}
              </h3>
              <p className="text-sm text-r6-light/60">
                {map.type}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Statistiques en preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-glass text-center">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i className="pi pi-check-circle text-green-400 text-lg"></i>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-1">67%</div>
            <div className="text-sm text-r6-light/70">Taux de Victoire Moyen</div>
          </div>
          
          <div className="card-glass text-center">
            <div className="w-10 h-10 bg-r6-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i className="pi pi-star text-r6-primary text-lg"></i>
            </div>
            <div className="text-2xl font-bold text-r6-primary mb-1">Clubhouse</div>
            <div className="text-sm text-r6-light/70">Meilleure Carte</div>
          </div>
          
          <div className="card-glass text-center">
            <div className="w-10 h-10 bg-r6-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i className="pi pi-target text-r6-accent text-lg"></i>
            </div>
            <div className="text-2xl font-bold text-r6-accent mb-1">1.34</div>
            <div className="text-sm text-r6-light/70">K/D Moyen</div>
          </div>
        </div>

        {/* Message de développement */}
        <div className="card-glass text-center py-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-r6-accent/20 text-r6-accent rounded-lg mb-6">
            <i className="pi pi-clock"></i>
            <span className="font-medium">En développement</span>
          </div>
          <h2 className="text-2xl font-semibold text-r6-light mb-4">
            Statistiques Détaillées par Carte
          </h2>
          <p className="text-r6-light/70 max-w-2xl mx-auto">
            Les analyses complètes par carte, incluant les positions favorites,
            les routes d&apos;attaque optimales et les statistiques de défense seront bientôt disponibles.
          </p>
        </div>
      </motion.div>
    </div>
  );
}