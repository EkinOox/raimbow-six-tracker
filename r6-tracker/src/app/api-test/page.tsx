'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ApiTestPage() {
  const [username, setUsername] = useState('Ekin0ox.DSG');
  const [platform, setPlatform] = useState('pc');
  const [method, setMethod] = useState<'getAccountInfo' | 'getId' | 'getPlayerStats'>('getId');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      switch (method) {
        case 'getAccountInfo':
          response = await fetch('/api/r6-data-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getAccountInfo',
              params: {
                nameOnPlatform: username,
                platformType: platform
              }
            })
          });
          break;
          
        case 'getId':
          response = await fetch('/api/r6-data-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getId',
              params: {
                platform,
                username
              }
            })
          });
          break;
          
        case 'getPlayerStats':
          response = await fetch('/api/r6-data-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getPlayerStats',
              params: {
                nameOnPlatform: username,
                platformType: platform,
                platform_families: ['pc', 'console']
              }
            })
          });
          break;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass-bg-dark/90 backdrop-blur-glass border border-glass-border-dark rounded-2xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-r6-light mb-6">🧪 Test API R6</h1>
          
          {/* Formulaire */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-r6-light mb-2">Nom d&apos;utilisateur</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-r6-dark border border-glass-border-dark rounded-lg text-r6-light focus:outline-none focus:border-r6-primary"
                placeholder="Ekin0ox.DSG"
              />
            </div>

            <div>
              <label className="block text-r6-light mb-2">Plateforme</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2 bg-r6-dark border border-glass-border-dark rounded-lg text-r6-light focus:outline-none focus:border-r6-primary"
              >
                <option value="pc">PC / Uplay</option>
                <option value="psn">PlayStation</option>
                <option value="xbl">Xbox</option>
              </select>
            </div>

            <div>
              <label className="block text-r6-light mb-2">Méthode API</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full px-4 py-2 bg-r6-dark border border-glass-border-dark rounded-lg text-r6-light focus:outline-none focus:border-r6-primary"
              >
                <option value="getId">getId (Recommandé)</option>
                <option value="getAccountInfo">getAccountInfo</option>
                <option value="getPlayerStats">getPlayerStats</option>
              </select>
            </div>

            <button
              onClick={testApi}
              disabled={loading}
              className="w-full px-6 py-3 bg-r6-primary hover:bg-r6-primary/80 disabled:bg-gray-600 text-white rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="pi pi-spin pi-spinner"></i>
                  Test en cours...
                </>
              ) : (
                <>
                  <i className="pi pi-bolt"></i>
                  Tester l&apos;API
                </>
              )}
            </button>
          </div>

          {/* Résultat */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <i className="pi pi-exclamation-triangle text-red-400 text-xl mt-1"></i>
                <div>
                  <h3 className="text-red-400 font-bold mb-1">Erreur</h3>
                  <p className="text-r6-light/80 text-sm">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <i className="pi pi-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <h3 className="text-green-400 font-bold mb-1">Succès</h3>
                  <p className="text-r6-light/80 text-sm">Données récupérées avec succès</p>
                </div>
              </div>

              {/* Affichage JSON */}
              <div className="bg-r6-dark rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs text-r6-light/80 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Info */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="pi pi-info-circle text-blue-400 text-xl mt-1"></i>
            <div className="text-sm text-r6-light/80">
              <p className="font-bold text-blue-400 mb-2">💡 Conseils :</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>getId</strong> est la méthode la plus fiable et rapide</li>
                <li><strong>getAccountInfo</strong> donne plus de détails mais peut échouer avec certains caractères</li>
                <li><strong>getPlayerStats</strong> donne les statistiques complètes de jeu</li>
                <li>Vérifiez que votre nom Ubisoft est exact (casse et caractères spéciaux)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
