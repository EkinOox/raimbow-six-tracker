'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store';

type ItemType = 'map' | 'operator' | 'weapon';

interface FavoriteButtonProps {
  itemType: ItemType;
  itemId: string;
  itemName: string;
  metadata?: {
    image?: string;
    type?: string;
    side?: string;
    category?: string;
    location?: string;
    [key: string]: unknown;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FavoriteButton({
  itemType,
  itemId,
  itemName,
  metadata = {},
  className = '',
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Vérifier si l'item est en favoris au chargement
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
            itemType,
            itemId,
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
  }, [isAuthenticated, token, itemType, itemId]);

  const handleClick = async (e: React.MouseEvent) => {
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
          itemType,
          itemId,
          itemName,
          metadata,
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

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`
          ${sizes[size]}
          ${className}
          relative flex items-center justify-center
          rounded-full backdrop-blur-sm
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFavorite
              ? 'bg-red-500/20 border-2 border-red-500 text-red-500'
              : 'bg-white/10 border-2 border-white/30 text-white/60 hover:border-white/50 hover:text-white'
          }
        `}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {loading ? (
          <i className={`pi pi-spin pi-spinner ${iconSizes[size]}`}></i>
        ) : (
          <motion.i
            className={`pi ${isFavorite ? 'pi-heart-fill' : 'pi-heart'} ${iconSizes[size]}`}
            animate={{
              scale: isFavorite && isHovered ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Label optionnel */}
        {showLabel && (
          <span className="ml-2 text-sm font-medium">
            {isFavorite ? 'Favori' : 'Ajouter'}
          </span>
        )}

        {/* Animation de particules lors de l'ajout */}
        {isFavorite && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-red-500"
          />
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

