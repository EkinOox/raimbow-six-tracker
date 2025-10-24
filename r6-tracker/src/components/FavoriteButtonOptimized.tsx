'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store';

type ItemType = 'map' | 'operator' | 'weapon';

interface FavoriteButtonOptimizedProps {
  itemType: ItemType;
  itemId: string;
  itemName: string;
  isFavorite: boolean;
  onToggle?: (itemId: string, newState: boolean) => void;
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
}

export default function FavoriteButtonOptimized({
  itemType,
  itemId,
  itemName,
  isFavorite: initialIsFavorite,
  onToggle,
  metadata = {},
  className = '',
  size = 'md',
}: FavoriteButtonOptimizedProps) {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

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
        const newState = data.action === 'added';
        setIsFavorite(newState);
        setToastMessage(data.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        // Notifier le parent du changement
        if (onToggle) {
          onToggle(itemId, newState);
        }
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
