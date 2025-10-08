'use client';

// Page de test API
// Encodage: UTF-8

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { R6MockApi } from '../../services/r6MockApi';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  data?: unknown;
  error?: string;
  duration?: number;
}

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runApiTest = useCallback(async (
    testName: string,
    apiCall: () => Promise<unknown>
  ): Promise<ApiTestResult> => {
    const startTime = Date.now();
    
    try {
      const data = await apiCall();
      const duration = Date.now() - startTime;
      
      return {
        endpoint: testName,
        status: 'success',
        data,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        endpoint: testName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        duration
      };
    }
  }, []);

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Test de Connexion',
        call: () => R6MockApi.testConnection()
      },
      {
        name: 'Validation Nom d\'Utilisateur',
        call: () => Promise.resolve(R6MockApi.validateUsername('TestUser123'))
      },
      {
        name: 'Stats Générales (PC)',
        call: () => R6MockApi.getGeneralStats('pc', 'TestUser123')
      },
      {
        name: 'Stats Ranked (PC)',
        call: () => R6MockApi.getRankedStats('pc', 'TestUser123')
      },
      {
        name: 'Stats Casual (PC)',
        call: () => R6MockApi.getCasualStats('pc', 'TestUser123')
      },
      {
        name: 'Stats Générales (Xbox)',
        call: () => R6MockApi.getGeneralStats('xbox', 'XboxGamer456')
      },
      {
        name: 'Stats Générales (PSN)',
        call: () => R6MockApi.getGeneralStats('psn', 'PSNPlayer789')
      },
      {
        name: 'Validation Nom Invalide',
        call: () => Promise.resolve(R6MockApi.validateUsername('ab'))
      },
    ];

    for (const test of tests) {
      const result = await runApiTest(test.name, test.call);
      setTestResults(prev => [...prev, result]);
    }
    
    setIsRunningTests(false);
  }, [runApiTest]);

  const getStatusIcon = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return 'pi-check-circle';
      case 'error':
        return 'pi-times-circle';
      case 'loading':
        return 'pi-spinner pi-spin';
      default:
        return 'pi-question';
    }
  };

  const getStatusColor = (status: ApiTestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'loading':
        return 'text-r6-accent';
      default:
        return 'text-r6-light/60';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-r6 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="pi pi-cog text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-r6-light mb-4">
            Test API
          </h1>
          <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
            Testez la connectivité de l&apos;API R6 et explorez les différents endpoints disponibles.
          </p>
        </div>

        {/* Bouton de test */}
        <div className="card-glass mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-r6-light mb-4">
              Tests Automatisés
            </h2>
            <p className="text-r6-light/70 mb-6">
              Lancez une série de tests pour vérifier le bon fonctionnement de tous les endpoints API.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runAllTests}
              disabled={isRunningTests}
              className="btn-r6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunningTests ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Tests en cours...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <i className="pi pi-play"></i>
                  <span>Lancer les Tests</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass"
          >
            <h3 className="text-xl font-semibold text-r6-light mb-6">
              Résultats des Tests
            </h3>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <motion.div
                  key={result.endpoint}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-glass-bg/20 rounded-lg border border-glass-border/20"
                >
                  <div className="flex items-center space-x-3">
                    <i className={`pi ${getStatusIcon(result.status)} ${getStatusColor(result.status)} text-lg`}></i>
                    <div>
                      <div className="font-medium text-r6-light">
                        {result.endpoint}
                      </div>
                      {result.error && (
                        <div className="text-sm text-red-400">
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {result.duration && (
                      <div className="text-sm text-r6-light/60">
                        {result.duration}ms
                      </div>
                    )}
                    <div className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                      {result.status === 'success' ? 'Succès' : 
                       result.status === 'error' ? 'Échec' : 'En cours...'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Résumé */}
            {testResults.length > 0 && !isRunningTests && (
              <div className="mt-6 pt-6 border-t border-glass-border/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {testResults.filter(r => r.status === 'success').length}
                    </div>
                    <div className="text-sm text-r6-light/70">Succès</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {testResults.filter(r => r.status === 'error').length}
                    </div>
                    <div className="text-sm text-r6-light/70">Échecs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-r6-accent">
                      {Math.round(testResults.reduce((acc, r) => acc + (r.duration || 0), 0) / testResults.length)}ms
                    </div>
                    <div className="text-sm text-r6-light/70">Latence Moy.</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Informations sur l'API */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass mt-8"
        >
          <h3 className="text-xl font-semibold text-r6-light mb-4">
            Informations sur l&apos;API
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-r6-light mb-2">Endpoints Disponibles</h4>
              <ul className="space-y-1 text-sm text-r6-light/70">
                <li>• Test de connexion</li>
                <li>• Validation des noms d&apos;utilisateur</li>
                <li>• Statistiques générales</li>
                <li>• Statistiques ranked</li>
                <li>• Statistiques casual</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-r6-light mb-2">Plateformes Supportées</h4>
              <ul className="space-y-1 text-sm text-r6-light/70">
                <li>• PC (Uplay)</li>
                <li>• Xbox Live</li>
                <li>• PlayStation Network</li>
                <li>• Console (Générique)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-r6-accent/10 rounded-lg border border-r6-accent/20">
            <div className="flex items-start space-x-2">
              <i className="pi pi-info-circle text-r6-accent text-lg mt-0.5"></i>
              <div>
                <div className="font-medium text-r6-accent mb-1">API Mock</div>
                <div className="text-sm text-r6-light/70">
                  Cette application utilise une API mock pour la démonstration. 
                  Les données sont générées de manière cohérente pour les tests.
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}