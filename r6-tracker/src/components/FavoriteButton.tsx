'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store';
import { toggleFavorite, FavoriteType } from '../store/slices/favoritesSlice';

interface FavoriteButtonProps {
  itemType: FavoriteType;
  itemId: string;
  itemName: string;
  metadata?: {
    image?: string;
    type?: string;
    side?: string;
    category?: string;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function FavoriteButton({
  itemType,
  itemId,
  itemName,
  metadata,
  className = '',
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) {
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector((state) => state.favorites);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Vérifier si l'élément est en favori
  useEffect(() => {
    const favorite = favorites.find(
      (f) => f.itemType === itemType && f.itemId === itemId
    );
    setIsFavorite(!!favorite);
  }, [favorites, itemType, itemId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Vous devez être connecté pour ajouter des favoris');
      return;
    }

    dispatch(
      toggleFavorite({
        itemType,
        itemId,
        itemName,
        metadata,
      })
    );
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
    <motion.button
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        ${sizes[size]}
        ${className}
        relative flex items-center justify-center
        rounded-full backdrop-blur-sm
        transition-all duration-300
        ${
          isFavorite
            ? 'bg-red-500/20 border-2 border-red-500 text-red-500'
            : 'bg-white/10 border-2 border-white/30 text-white/60 hover:border-white/50 hover:text-white'
        }
      `}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <motion.i
        className={`pi ${isFavorite ? 'pi-heart-fill' : 'pi-heart'} ${iconSizes[size]}`}
        animate={{
          scale: isFavorite && isHovered ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      />

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
  );
}
