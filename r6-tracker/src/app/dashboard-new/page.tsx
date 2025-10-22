'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '../../store';
import { getMe, logout } from '../../store/slices/authSlice';
import { fetchFavorites, FavoriteType } from '../../store/slices/favoritesSlice';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector((state) => state.auth);
  const { operators, weapons, maps, loading: favoritesLoading } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getMe());
    } else if (!token) {
      router.push('/auth');
    }
  }, [dispatch, user, router]);

  useEffect(() => {
    // Charger les favoris si authentifié
    if (isAuthenticated && user) {
      dispatch(fetchFavorites(undefined));
    }
  }, [isAuthenticated, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
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
                Bienvenue, <span className="text-orange-500">{user.username}</span>
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
    };
  };
  href: string;
}

function FavoriteCard({ favorite, href }: FavoriteCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 hover:border-white/40 transition-all cursor-pointer group"
      >
        {favorite.metadata?.image && (
          <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-black/30">
            <Image
              src={favorite.metadata.image}
              alt={favorite.itemName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        )}
        
        <h3 className="text-white font-medium text-center mb-1 truncate">
          {favorite.itemName}
        </h3>
        
        {favorite.metadata?.type && (
          <p className="text-xs text-gray-400 text-center truncate">
            {favorite.metadata.type}
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
  );
}
