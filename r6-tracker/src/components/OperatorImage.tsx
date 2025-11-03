'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OperatorImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

/**
 * Composant Image pour les opérateurs avec gestion robuste des erreurs et timeouts
 */
export default function OperatorImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  priority = false 
}: OperatorImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}`);
    setHasError(true);
    setImgSrc('/images/logo/r6-logo.png');
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {/* Skeleton loader pendant le chargement */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 animate-pulse" />
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        quality={priority ? 85 : 75}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzJhMmEzYSIvPjwvc3ZnPg=="
      />
      
      {/* Indicateur si erreur */}
      {hasError && (
        <div className="absolute top-2 left-2 bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
          <i className="pi pi-exclamation-triangle mr-1"></i>
          Offline
        </div>
      )}
    </div>
  );
}
