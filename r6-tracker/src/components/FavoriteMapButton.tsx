'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store';

interface FavoriteMapButtonProps {
  mapId: string;
  mapName: string;
  mapLocation?: string;
  mapImage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteMapButton({
  mapId,
  mapName,
  mapLocation,
  mapImage,
  className = '',
  size = 'md',
}: FavoriteMapButtonProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Tailles des icônes
  const sizes = {
    sm: 'text-base p-1.5',
    md: 'text-lg p-2',
    lg: 'text-xl p-3',
  };

  // Vérifier si la map est en favoris au chargement
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !token) return;
      
      try {
        const response = await fetch('/api/favorites/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemType: 'map',
            itemId: mapId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du favori:', error);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, token, mapId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setToastMessage('Connectez-vous pour ajouter des favoris');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemType: 'map',
          itemId: mapId,
          itemName: mapName,
          metadata: {
            image: mapImage,
            type: 'map',
            location: mapLocation,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.action === 'added');
        setToastMessage(data.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        throw new Error('Erreur lors de la modification du favori');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setToastMessage('Erreur lors de la modification du favori');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={toggleFavorite}
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          ${sizes[size]}
          ${isFavorite 
            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
            : 'bg-white/10 text-white/60 border-white/20 hover:text-red-400 hover:border-red-500/30'
          }
          border rounded-lg backdrop-blur-sm
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {loading ? (
          <i className="pi pi-spin pi-spinner"></i>
        ) : (
          <i className={`pi ${isFavorite ? 'pi-heart-fill' : 'pi-heart'}`}></i>
        )}
      </motion.button>

      {/* Toast notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 z-50 bg-glass-bg-dark/95 backdrop-blur-xl border border-glass-border-dark rounded-xl px-6 py-4 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <i className={`pi ${isFavorite ? 'pi-heart-fill text-red-400' : 'pi-heart text-white/60'} text-xl`}></i>
            <span className="text-r6-light">{toastMessage}</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
