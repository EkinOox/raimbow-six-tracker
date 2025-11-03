'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchFavorites, FavoriteType, toggleFavorite } from '../../store/slices/favoritesSlice';
import { getWeaponImageUrl } from '../../utils/weaponImages';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { operators, weapons, maps, loading: favoritesLoading } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    // Rediriger si non authentifié
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    // Charger les favoris si authentifié
    if (isAuthenticated && user) {
      dispatch(fetchFavorites(undefined));
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const handleRemoveFavorite = async (itemType: FavoriteType, itemId: string, itemName: string) => {
    try {
      await dispatch(toggleFavorite({ itemType, itemId, itemName })).unwrap();
      // Recharger les favoris après suppression
      dispatch(fetchFavorites(undefined));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <i className="pi pi-spin pi-spinner text-4xl text-orange-500 mb-4"></i>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bienvenue, <span className="text-orange-500">{user.name || 'Utilisateur'}</span>
              </h1>
              <p className="text-gray-400">{user.email}</p>
              {user.uplayProfile && (
                <p className="text-sm text-blue-400 mt-1">
                  <i className="pi pi-user mr-2"></i>
                  Profil Uplay: {user.uplayProfile}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <i className="pi pi-home mr-2"></i>
                Accueil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <i className="pi pi-sign-out mr-2"></i>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium mb-1">Opérateurs</p>
                <p className="text-3xl font-bold text-white">{operators.length}</p>
              </div>
              <i className="pi pi-users text-4xl text-orange-500/50"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Armes</p>
                <p className="text-3xl font-bold text-white">{weapons.length}</p>
              </div>
              <i className="pi pi-bookmark text-4xl text-blue-500/50"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium mb-1">Maps</p>
                <p className="text-3xl font-bold text-white">{maps.length}</p>
              </div>
              <i className="pi pi-map text-4xl text-green-500/50"></i>
            </div>
          </div>
        </div>

        {/* Favoris Sections */}
        {favoritesLoading ? (
          <div className="text-center py-12">
            <i className="pi pi-spin pi-spinner text-3xl text-orange-500"></i>
          </div>
        ) : (
          <>
            {/* Opérateurs Favoris */}
            <Section
              title="Mes Opérateurs Favoris"
              count={operators.length}
              emptyMessage="Aucun opérateur favori. Explorez les opérateurs et ajoutez-les à vos favoris !"
              icon="pi-users"
              color="orange"
              linkHref="/operators"
              linkText="Explorer les opérateurs"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {operators.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    favorite={fav}
                    href={`/operators/${fav.itemId}`}
                    onRemove={() => handleRemoveFavorite(FavoriteType.OPERATOR, fav.itemId, fav.itemName)}
                  />
                ))}
              </div>
            </Section>

            {/* Armes Favorites */}
            <Section
              title="Mes Armes Favorites"
              count={weapons.length}
              emptyMessage="Aucune arme favorite. Découvrez les armes et marquez vos préférées !"
              icon="pi-bookmark"
              color="blue"
              linkHref="/weapons"
              linkText="Explorer les armes"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {weapons.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    favorite={fav}
                    href={`/weapons/${fav.itemId}`}
                    onRemove={() => handleRemoveFavorite(FavoriteType.WEAPON, fav.itemId, fav.itemName)}
                  />
                ))}
              </div>
            </Section>

            {/* Maps Favorites */}
            <Section
              title="Mes Maps Favorites"
              count={maps.length}
              emptyMessage="Aucune map favorite. Parcourez les maps et sauvegardez vos préférées !"
              icon="pi-map"
              color="green"
              linkHref="/maps"
              linkText="Explorer les maps"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {maps.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    favorite={fav}
                    href="/maps"
                    onRemove={() => handleRemoveFavorite(FavoriteType.MAP, fav.itemId, fav.itemName)}
                  />
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

// Composant Section
interface SectionProps {
  title: string;
  count: number;
  emptyMessage: string;
  icon: string;
  color: 'orange' | 'blue' | 'green';
  linkHref: string;
  linkText: string;
  children: React.ReactNode;
}

function Section({ title, count, emptyMessage, icon, color, linkHref, linkText, children }: SectionProps) {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6 mb-8`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <i className={`pi ${icon} text-2xl text-white/70`}></i>
          <h2 className="text-2xl font-bold text-white">
            {title} <span className="text-white/50">({count})</span>
          </h2>
        </div>
        <Link
          href={linkHref}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
        >
          {linkText} →
        </Link>
      </div>

      {count === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">{emptyMessage}</p>
          <Link
            href={linkHref}
            className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            {linkText}
          </Link>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

// Composant FavoriteCard
interface FavoriteCardProps {
  favorite: {
    _id: string;
    itemId: string;
    itemName: string;
    itemType: FavoriteType;
    metadata?: {
      image?: string;
      type?: string;
      side?: string;
      category?: string;
      location?: string;
    };
  };
  href: string;
  onRemove?: () => void;
}

function FavoriteCard({ favorite, href, onRemove }: FavoriteCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      await onRemove();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setShowConfirm(false);
  };

  const cancelRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };
  
  // Déterminer l'URL de l'image selon le type
  const getImageUrl = () => {
    if (favorite.itemType === FavoriteType.WEAPON) {
      // Pour les armes, utiliser getWeaponImageUrl
      return getWeaponImageUrl(favorite.itemName, favorite.metadata?.image);
    }
    // Pour les autres types, utiliser l'image depuis metadata
    return favorite.metadata?.image || '/images/logo/r6x-logo-ww.avif';
  };

  return (
    <div className="relative">
      <Link href={href}>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:border-white/40 transition-all cursor-pointer group relative"
        >
          {/* Bouton de suppression */}
          {!showConfirm && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
              title="Retirer des favoris"
            >
              <i className="pi pi-times text-sm"></i>
            </button>
          )}

          {/* Image avec gestion différente selon le type */}
          <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Image
              src={getImageUrl()}
              alt={favorite.itemName}
              fill
              className={`${
                favorite.itemType === FavoriteType.WEAPON 
                  ? 'object-contain p-4' 
                  : 'object-cover'
              } group-hover:scale-110 transition-transform duration-300`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/logo/r6x-logo-ww.avif';
              }}
            />
          </div>
          
          <h3 className="text-white font-medium text-center mb-1 truncate">
            {favorite.itemName}
          </h3>
          
          {(favorite.metadata?.type || favorite.metadata?.location) && (
            <p className="text-xs text-gray-400 text-center truncate">
              {favorite.metadata?.location || favorite.metadata?.type}
            </p>
          )}

          <div className="mt-2 flex justify-center">
            <span className={`text-xs px-2 py-1 rounded-full ${
              favorite.itemType === FavoriteType.OPERATOR
                ? 'bg-orange-500/20 text-orange-400'
                : favorite.itemType === FavoriteType.WEAPON
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-green-500/20 text-green-400'
            }`}>
              <i className={`pi ${
                favorite.itemType === FavoriteType.OPERATOR
                  ? 'pi-user'
                  : favorite.itemType === FavoriteType.WEAPON
                  ? 'pi-bookmark'
                  : 'pi-map'
              } mr-1`}></i>
              {favorite.metadata?.side || favorite.metadata?.category || favorite.itemType}
            </span>
          </div>
        </motion.div>
      </Link>

      {/* Modal de confirmation */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-20 bg-black/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 border-2 border-red-500/50"
        >
          <i className="pi pi-exclamation-triangle text-3xl text-red-400 mb-3"></i>
          <p className="text-white text-center text-sm mb-4">
            Retirer <strong>{favorite.itemName}</strong> ?
          </p>
          <div className="flex gap-2 w-full">
            <button
              onClick={confirmRemove}
              className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            >
              Oui
            </button>
            <button
              onClick={cancelRemove}
              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              Non
            </button>
          </div>
        </motion.div>
      )}

      {/* Toast de confirmation de suppression */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-8 right-8 z-50 bg-green-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2"
        >
          <i className="pi pi-check-circle"></i>
          <span>Retiré des favoris</span>
        </motion.div>
      )}
    </div>
  );
}
