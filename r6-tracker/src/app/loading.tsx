'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-r6-dark">
      <div className="text-center">
        {/* Logo animé avec pulse */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.1, 1],
            opacity: 1
          }}
          transition={{ 
            duration: 0.6,
            ease: 'easeOut'
          }}
          className="mb-8"
        >
          <motion.div
            animate={{ 
              rotate: 360
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="w-24 h-24 mx-auto border-4 border-r6-primary border-t-transparent rounded-full"
          />
        </motion.div>

        {/* Texte de chargement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-white">
            Chargement en cours...
          </h2>
          
          {/* Barre de progression animée */}
          <div className="w-64 h-2 bg-r6-dark-secondary rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-r6-primary via-orange-500 to-r6-accent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>

          {/* Points animés */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-r6-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
