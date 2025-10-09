'use client';

// Page de recherche de joueurs avec nouveau composant
// Encodage: UTF-8

import PlayerSearch from '../../components/PlayerSearch';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <PlayerSearch />
      </div>
    </div>
  );
}