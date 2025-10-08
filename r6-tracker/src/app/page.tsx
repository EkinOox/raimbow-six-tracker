'use client';

// Page d'accueil R6 Tracker
// Encodage: UTF-8

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: 'pi-search',
    title: 'Recherche Avancée',
    description: 'Trouvez instantanément les statistiques de n&apos;importe quel joueur sur toutes les plateformes.',
    href: '/search'
  },
  {
    icon: 'pi-chart-bar',
    title: 'Statistiques Détailées',
    description: 'Consultez les stats générales, ranked et casual avec des visualisations modernes.',
    href: '/dashboard'
  },
  {
    icon: 'pi-arrow-right-arrow-left',
    title: 'Comparaison',
    description: 'Comparez les performances de plusieurs joueurs côte à côte.',
    href: '/comparison'
  },
  {
    icon: 'pi-users',
    title: 'Opérateurs',
    description: 'Découvrez les statistiques par opérateur et optimisez votre gameplay.',
    href: '/operators'
  },
  {
    icon: 'pi-map',
    title: 'Cartes',
    description: 'Analysez vos performances sur chaque carte du jeu.',
    href: '/maps'
  },
  {
    icon: 'pi-cog',
    title: 'API Test',
    description: 'Testez la connectivité et explorez les fonctionnalités de l&apos;API.',
    href: '/api-test'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100
    }
  }
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo principal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-r6 rounded-2xl shadow-r6-glow opacity-80"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 p-2">
                  <Image
                    src="/images/logo/r6-logo.png"
                    alt="R6 Tracker Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-r6-light mb-4">
                R6 <span className="text-r6-primary">Tracker</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl lg:text-2xl text-r6-light/80 mb-8 max-w-3xl mx-auto"
            >
              Suivez vos statistiques Rainbow Six Siege avec une interface moderne 
              et des données en temps réel. Analysez vos performances et progressez.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-r6 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-r6-glow"
              >
                <i className="pi pi-search mr-2"></i>
                Commencer la Recherche
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-glass-bg/20 backdrop-blur-sm border border-glass-border/30 text-r6-light font-semibold rounded-xl hover:border-r6-primary/50 hover:scale-105 transition-all duration-200"
              >
                <i className="pi pi-chart-bar mr-2"></i>
                Voir le Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités qui font de R6 Tracker
              l&apos;outil ultime pour suivre vos performances.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.href}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Link href={feature.href}>
                  <div className="card-glass group-hover:border-r6-primary/50 h-full">
                    <div className="w-12 h-12 bg-r6-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-r6-primary/30 transition-colors">
                      <i className={`pi ${feature.icon} text-r6-primary text-xl`}></i>
                    </div>
                    <h3 className="text-xl font-semibold text-r6-light mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-r6-light/70 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-r6-primary font-medium group-hover:text-r6-accent transition-colors">
                      <span>En savoir plus</span>
                      <i className="pi pi-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-glass-bg-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
              Pourquoi Choisir R6 Tracker ?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { number: '100%', label: 'Gratuit' },
              { number: '24/7', label: 'Disponibilité' },
              { number: 'Multi', label: 'Plateformes' },
              { number: 'Temps Réel', label: 'Données' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-r6-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-r6-light/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-glass"
          >
            <div className="py-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
                Prêt à Améliorer Votre Jeu ?
              </h2>
              <p className="text-lg text-r6-light/70 mb-8">
                Commencez dès maintenant à analyser vos performances
                et progressez vers le rang que vous visez.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-r6 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-r6-glow"
              >
                <i className="pi pi-play mr-2"></i>
                Commencer Maintenant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}