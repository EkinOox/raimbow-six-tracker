import type { Metadata } from 'next';
import { Shield, Code, Database, Lock, Zap, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos - R6 Tracker',
  description: 'En savoir plus sur R6 Tracker, l\'application de suivi des statistiques Rainbow Six Siege.',
  openGraph: {
    title: 'À Propos - R6 Tracker',
    description: 'Découvrez R6 Tracker, votre compagnon pour suivre vos performances Rainbow Six Siege.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            R6 Tracker
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Votre compagnon ultime pour suivre et analyser vos performances Rainbow Six Siege
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Notre Mission</h2>
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            R6 Tracker a été créé pour offrir à la communauté Rainbow Six Siege un outil moderne, 
            rapide et sécurisé pour suivre leurs statistiques de jeu. Notre objectif est de fournir 
            une expérience utilisateur exceptionnelle tout en respectant les meilleures pratiques 
            de développement web.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Que vous soyez un joueur occasionnel ou un compétiteur acharné, R6 Tracker vous donne 
            les outils nécessaires pour comprendre vos performances, comparer des opérateurs et 
            suivre votre progression au fil du temps.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Caractéristiques Principales</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Sécurité Renforcée</h3>
              <p className="text-gray-400">
                Authentification NextAuth.js avec cookies HTTP-only, protection CSRF et validation Zod sur toutes les entrées.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
              <Zap className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Performance Optimale</h3>
              <p className="text-gray-400">
                Built avec Next.js 15 et Turbopack, images AVIF/WebP, système de cache intelligent et code splitting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-green-500 transition-colors">
              <Database className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Données Complètes</h3>
              <p className="text-gray-400">
                Accès aux statistiques de tous les opérateurs, armes et cartes avec mise à jour régulière.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition-colors">
              <Users className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Comparaison</h3>
              <p className="text-gray-400">
                Comparez jusqu'à 4 joueurs, analysez les opérateurs et armes côte à côte.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-red-500 transition-colors">
              <Lock className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Favoris Personnalisés</h3>
              <p className="text-gray-400">
                Sauvegardez vos joueurs préférés et accédez rapidement à leurs statistiques.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
              <Code className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Open Source</h3>
              <p className="text-gray-400">
                Code disponible sur GitHub, contributions bienvenues de la communauté.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Stack Technique</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Frontend */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-700/20 p-8 rounded-lg border border-blue-500/30">
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Frontend</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="text-blue-400 mr-2">▸</span>
                  Next.js 15.5.4 (App Router)
                </li>
                <li className="flex items-center">
                  <span className="text-blue-400 mr-2">▸</span>
                  TypeScript 5.x
                </li>
                <li className="flex items-center">
                  <span className="text-blue-400 mr-2">▸</span>
                  Tailwind CSS 3.4
                </li>
                <li className="flex items-center">
                  <span className="text-blue-400 mr-2">▸</span>
                  Redux Toolkit
                </li>
                <li className="flex items-center">
                  <span className="text-blue-400 mr-2">▸</span>
                  Framer Motion
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-700/20 p-8 rounded-lg border border-purple-500/30">
              <h3 className="text-2xl font-semibold mb-6 text-purple-400">Backend</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">▸</span>
                  NextAuth.js v5 (Auth.js)
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">▸</span>
                  MongoDB Atlas + Mongoose
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">▸</span>
                  Zod 4.1.12 (Validation)
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">▸</span>
                  Sharp 0.34.4 (Images)
                </li>
                <li className="flex items-center">
                  <span className="text-purple-400 mr-2">▸</span>
                  Cache Memory/Redis
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Équipe</h2>
          <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 inline-block">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl font-bold">E</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2">EkinOox</h3>
              <p className="text-gray-400 mb-4">Développeur Principal</p>
              <a 
                href="https://github.com/EkinOox" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                @EkinOox sur GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contribute Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Contribuer</h2>
          <p className="text-lg text-gray-300 mb-8">
            R6 Tracker est un projet open source. Les contributions sont les bienvenues !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/EkinOox/raimbow-six-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Voir sur GitHub
            </a>
            <a
              href="https://github.com/EkinOox/raimbow-six-tracker/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gray-800 border border-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              Signaler un bug
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-2">
            R6 Tracker n&apos;est pas affilié à Ubisoft Entertainment. Rainbow Six Siege est une marque déposée d&apos;Ubisoft.
          </p>
          <p>
            Fait avec ❤️ pour la communauté Rainbow Six Siege
          </p>
        </div>
      </footer>
    </div>
  );
}
