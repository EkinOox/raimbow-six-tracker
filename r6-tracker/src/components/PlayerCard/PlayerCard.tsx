'use client';

// Composant PlayerCard pour l'affichage des statistiques
// Encodage: UTF-8

import { motion } from 'framer-motion';
import {
  SimplePlayerStats,
  SimpleRankedStats,
  SimpleCasualStats,
  StatsType
} from '../../types/r6';

interface PlayerCardProps {
  stats: SimplePlayerStats | SimpleRankedStats | SimpleCasualStats;
  type: StatsType;
  className?: string;
}

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color?: string;
}

function StatItem({ label, value, icon, color = 'text-r6-light' }: StatItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-3 rounded-lg bg-glass-bg/30 backdrop-blur-sm border border-glass-border/20 hover:border-r6-primary/30 transition-all duration-200"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-r6-primary/20 flex items-center justify-center">
          <i className={`pi ${icon} text-r6-primary text-sm`}></i>
        </div>
        <span className="text-r6-light/80 text-sm font-medium">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </motion.div>
  );
}

function getRankColor(rank: string): string {
  const rankLower = rank.toLowerCase();
  if (rankLower.includes('champion')) return 'text-rank-champion';
  if (rankLower.includes('diamond')) return 'text-rank-diamond';
  if (rankLower.includes('platinum')) return 'text-rank-platinum';
  if (rankLower.includes('gold')) return 'text-rank-gold';
  if (rankLower.includes('silver')) return 'text-rank-silver';
  if (rankLower.includes('bronze')) return 'text-rank-bronze';
  if (rankLower.includes('copper')) return 'text-rank-copper';
  return 'text-r6-light/60';
}

export default function PlayerCard({ stats, type, className = '' }: PlayerCardProps) {
  const renderGeneralStats = (generalStats: SimplePlayerStats) => (
    <>
      {/* En-tête avec nom et niveau */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-r6-light mb-2">{generalStats.name}</h2>
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-r6">
          <i className="pi pi-star text-white"></i>
          <span className="text-white font-semibold">Niveau {generalStats.level}</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatItem 
          label="K/D Ratio" 
          value={generalStats.kd} 
          icon="pi-target"
          color="text-r6-accent"
        />
        <StatItem 
          label="Taux de Victoire" 
          value={generalStats.win_} 
          icon="pi-trophy"
          color="text-green-400"
        />
        <StatItem 
          label="Kills" 
          value={generalStats.kills} 
          icon="pi-bolt"
        />
        <StatItem 
          label="Deaths" 
          value={generalStats.deaths} 
          icon="pi-times-circle"
        />
      </div>

      {/* Statistiques détaillées */}
      <div className="space-y-3">
        <StatItem 
          label="Headshots" 
          value={generalStats.headshot_} 
          icon="pi-crosshairs"
          color="text-red-400"
        />
        <StatItem 
          label="Victoires" 
          value={generalStats.wins} 
          icon="pi-check-circle"
          color="text-green-400"
        />
        <StatItem 
          label="Défaites" 
          value={generalStats.losses} 
          icon="pi-times-circle"
          color="text-red-400"
        />
        <StatItem 
          label="Matchs Joués" 
          value={generalStats.matches_played} 
          icon="pi-calendar"
        />
        <StatItem 
          label="Temps de Jeu" 
          value={generalStats.time_played} 
          icon="pi-clock"
        />
        <StatItem 
          label="Kills au Corps à Corps" 
          value={generalStats.melee_kills} 
          icon="pi-shield"
        />
      </div>
    </>
  );

  const renderRankedStats = (rankedStats: SimpleRankedStats) => (
    <>
      {/* En-tête avec rang */}
      <div className="text-center mb-6">
        <div className="mb-4">
          <div className={`text-2xl font-bold mb-2 ${getRankColor(rankedStats.current_rank)}`}>
            {rankedStats.current_rank}
          </div>
          <div className="text-lg text-r6-light/80">
            {rankedStats.current_mmr} MMR
          </div>
        </div>
        <div className="text-sm text-r6-light/60">
          <div>Meilleur Rang: <span className={getRankColor(rankedStats.max_rank)}>{rankedStats.max_rank}</span></div>
          <div>Meilleur MMR: {rankedStats.max_mmr}</div>
          <div className="mt-2 text-r6-accent">{rankedStats.season}</div>
        </div>
      </div>

      {/* Statistiques ranked */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatItem 
          label="K/D Ratio" 
          value={rankedStats.kd} 
          icon="pi-target"
          color="text-r6-accent"
        />
        <StatItem 
          label="Taux de Victoire" 
          value={rankedStats.win_} 
          icon="pi-trophy"
          color="text-green-400"
        />
      </div>

      <div className="space-y-3">
        <StatItem 
          label="Kills" 
          value={rankedStats.kills} 
          icon="pi-bolt"
        />
        <StatItem 
          label="Deaths" 
          value={rankedStats.deaths} 
          icon="pi-times-circle"
        />
        <StatItem 
          label="Victoires" 
          value={rankedStats.wins} 
          icon="pi-check-circle"
          color="text-green-400"
        />
        <StatItem 
          label="Défaites" 
          value={rankedStats.losses} 
          icon="pi-times-circle"
          color="text-red-400"
        />
        <StatItem 
          label="Matchs Joués" 
          value={rankedStats.matches_played} 
          icon="pi-calendar"
        />
        <StatItem 
          label="Temps de Jeu" 
          value={rankedStats.time_played} 
          icon="pi-clock"
        />
      </div>
    </>
  );

  const renderCasualStats = (casualStats: SimpleCasualStats) => (
    <>
      {/* En-tête casual */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-r6-light mb-2">Mode Casual</h3>
        <div className="text-lg text-r6-accent">
          {casualStats.mmr} MMR
        </div>
      </div>

      {/* Statistiques casual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatItem 
          label="K/D Ratio" 
          value={casualStats.kd} 
          icon="pi-target"
          color="text-r6-accent"
        />
        <StatItem 
          label="Taux de Victoire" 
          value={casualStats.win_} 
          icon="pi-trophy"
          color="text-green-400"
        />
      </div>

      <div className="space-y-3">
        <StatItem 
          label="Kills par Match" 
          value={casualStats.kills_per_match} 
          icon="pi-bolt"
          color="text-r6-primary"
        />
        <StatItem 
          label="Kills Total" 
          value={casualStats.kills} 
          icon="pi-bolt"
        />
        <StatItem 
          label="Deaths" 
          value={casualStats.deaths} 
          icon="pi-times-circle"
        />
        <StatItem 
          label="Victoires" 
          value={casualStats.wins} 
          icon="pi-check-circle"
          color="text-green-400"
        />
        <StatItem 
          label="Défaites" 
          value={casualStats.losses} 
          icon="pi-times-circle"
          color="text-red-400"
        />
        <StatItem 
          label="Matchs Joués" 
          value={casualStats.matches_played} 
          icon="pi-calendar"
        />
        <StatItem 
          label="Temps de Jeu" 
          value={casualStats.time_played} 
          icon="pi-clock"
        />
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`card-glass max-w-2xl mx-auto ${className}`}
    >
      {type === 'general' && renderGeneralStats(stats as SimplePlayerStats)}
      {type === 'ranked' && renderRankedStats(stats as SimpleRankedStats)}
      {type === 'casual' && renderCasualStats(stats as SimpleCasualStats)}
    </motion.div>
  );
}