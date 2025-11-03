'use client';

import { useState } from 'react';
import Image from 'next/image';

interface YouTubeLiteProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
}

/**
 * Composant YouTube optimisé avec lazy loading
 * Charge uniquement une miniature jusqu'au clic utilisateur
 * Économise ~500KB de ressources par iframe
 */
export default function YouTubeLite({
  videoId,
  title,
  autoplay = false,
  muted = true,
  className = '',
}: YouTubeLiteProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (!isLoaded) {
    return (
      <div
        className={`relative cursor-pointer group ${className}`}
        onClick={handleLoad}
      >
        {/* Thumbnail YouTube */}
        <Image
          src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
          alt={title}
          fill
          className="object-cover"
          quality={70}
          loading="lazy"
        />
        
        {/* Overlay sombre au hover */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
        
        {/* Bouton Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl">
            <svg
              className="w-10 h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Badge "Cliquez pour charger" */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
          🎬 Cliquer pour charger la vidéo
        </div>
      </div>
    );
  }

  // Paramètres YouTube optimisés
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    modestbranding: '1',
    rel: '0',
    iv_load_policy: '3',
    color: 'white',
  });

  return (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
      title={title}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={className}
    />
  );
}
