"use client";
import { useState } from 'react';
import Image from 'next/image';
import { FloorKey } from '../lib/mapImages';
import { floorLabelFR, floorOrder } from '../lib/floorLabels';
import type { Map } from '../types/r6-api-types';

interface Props {
  grouped: Record<string, string[]>;
  slug: string;
  mapData?: Map | null;
}

export default function MapGallery({ grouped, slug, mapData }: Props) {
  const floors = floorOrder.filter((f) => (grouped[f] && grouped[f].length > 0));
  const initialFloor: FloorKey | string = floors.length > 0 ? floors[0] : (Object.keys(grouped)[0] || 'other');

  const [selectedFloor, setSelectedFloor] = useState<string>(initialFloor as string);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const imgsForFloor = (grouped[selectedFloor] || []) as string[];
  const mainSrc = imgsForFloor[selectedIndex] || imgsForFloor[0] || '';

  const totalImages = Object.values(grouped).reduce((s, arr) => s + (arr?.length || 0), 0);

  return (
    <div className="fixed inset-0 bg-black z-40 h-screen w-screen">
      {/* Full-screen image */}
      <div className="w-full h-full flex items-center justify-center">
        {mainSrc ? (
          <Image 
            src={mainSrc} 
            alt={`${slug} - ${selectedFloor}`} 
            width={1600} 
            height={1000} 
            className="w-full h-full object-contain" 
            priority
          />
        ) : (
          <div className="text-white/60 p-8">Aucune image disponible pour cet étage.</div>
        )}
      </div>

      {/* Top overlay: Floor selector + Info button */}
      <div className="absolute top-16 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {floorOrder.map((floor) => {
              const imgs = grouped[floor] as string[] | undefined;
              const count = imgs ? imgs.length : 0;
              const disabled = count === 0;
              let btnCls = 'px-3 py-2 rounded-lg text-sm font-semibold backdrop-blur-md ';
              btnCls += selectedFloor === floor 
                ? 'bg-white/20 text-white border border-white/30' 
                : 'bg-black/30 text-white/80 border border-white/10';
              if (disabled) btnCls += ' opacity-40 pointer-events-none';
              return (
                <button
                  key={floor}
                  onClick={() => {
                    setSelectedFloor(floor);
                    setSelectedIndex(0);
                  }}
                  className={btnCls}
                >
                  {floorLabelFR(floor as FloorKey)} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowInfo(true)}
            aria-label="Infos map"
            className="bg-black/40 hover:bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg border border-white/20 ml-4"
          >
            ℹ️ Info
          </button>
        </div>
      </div>

      {/* Bottom overlay: Thumbnails */}
      {imgsForFloor.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {imgsForFloor.map((src, idx) => {
              const thumbCls = selectedIndex === idx 
                ? 'rounded overflow-hidden ring-2 ring-white backdrop-blur-sm flex-shrink-0' 
                : 'rounded border border-white/20 overflow-hidden backdrop-blur-sm flex-shrink-0 opacity-70 hover:opacity-100';
              return (
                <button key={src} onClick={() => setSelectedIndex(idx)} className={thumbCls}>
                  <Image 
                    src={src} 
                    alt={`${slug} thumb ${idx}`} 
                    width={160} 
                    height={90} 
                    className="w-32 h-20 object-cover" 
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Info modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/70 backdrop-blur-sm">
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Informations — {mapData?.name || slug.replace(/-/g, ' ')}</h3>
              <button 
                onClick={() => setShowInfo(false)} 
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg"
              >
                ✕ Fermer
              </button>
            </div>
            <div className="text-white/80 space-y-4">
              {/* Informations de la carte */}
              {mapData && (
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-white mb-3">Détails de la carte</h4>
                  
                  {/* Localisation */}
                  {mapData.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 flex items-center gap-2">
                        <i className="pi pi-map-marker"></i>
                        Localisation:
                      </span>
                      <span className="font-medium text-white">{mapData.location}</span>
                    </div>
                  )}
                  
                  {/* Modes de jeu */}
                  {mapData.playlists && (
                    <div className="flex items-start justify-between">
                      <span className="text-white/60 flex items-center gap-2">
                        <i className="pi pi-list"></i>
                        Modes de jeu:
                      </span>
                      <span className="font-medium text-white text-right">{mapData.playlists}</span>
                    </div>
                  )}
                  
                  {/* Date de sortie */}
                  {mapData.releaseDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 flex items-center gap-2">
                        <i className="pi pi-calendar"></i>
                        Date de sortie:
                      </span>
                      <span className="font-medium text-white">{mapData.releaseDate}</span>
                    </div>
                  )}
                  
                  {/* Rework */}
                  {mapData.mapReworked && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 flex items-center gap-2">
                        <i className="pi pi-refresh"></i>
                        Rework:
                      </span>
                      <span className="font-medium text-r6-primary">{mapData.mapReworked}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Informations des images */}
              <div>
                <p className="mb-3">
                  <span className="text-white/60">Slug:</span> <span className="font-mono text-sm bg-white/10 px-2 py-1 rounded">{slug}</span>
                </p>
                <p className="mb-4">
                  <span className="text-white/60">Images totales:</span> <strong className="text-white">{totalImages}</strong>
                </p>
              </div>
              
              {/* Répartition par étage */}
              <div>
                <h4 className="font-semibold text-white mb-2">Répartition par étage</h4>
                <ul className="space-y-2 text-sm">
                  {floorOrder.map((f) => {
                    const count = (grouped[f] || []).length;
                    return count > 0 ? (
                      <li key={f} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg">
                        <span>{floorLabelFR(f as FloorKey)}</span>
                        <span className="font-semibold text-white">{count} image{count > 1 ? 's' : ''}</span>
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
