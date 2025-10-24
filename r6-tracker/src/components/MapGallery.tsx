"use client";
import { useState } from 'react';
import Image from 'next/image';
import { FloorKey } from '../lib/mapImages';
import { floorLabelFR, floorOrder } from '../lib/floorLabels';

interface Props {
  grouped: Record<string, string[]>;
  slug: string;
}

export default function MapGallery({ grouped, slug }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<{ src: string; alt: string } | null>(null);

  const open = (src: string, floor: string) => {
    setCurrent({ src, alt: `${slug} - ${floor}` });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCurrent(null);
  };

  return (
    <div>
      {floorOrder.map((floor: FloorKey) => {
        const imgs = grouped[floor] as string[] | undefined;
        if (!imgs || imgs.length === 0) return null;

        return (
          <section key={floor} className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">{floorLabelFR(floor as FloorKey)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imgs.map((src) => (
                <button
                  key={src}
                  onClick={() => open(src, floor)}
                  className="rounded-lg overflow-hidden bg-white/5 border border-white/10"
                >
                  <Image src={src} alt={`${slug} - ${floor}`} width={1200} height={800} className="w-full h-auto object-contain" />
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {isOpen && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={close}>
          <div className="max-w-5xl w-full">
            <button onClick={close} className="text-white mb-3 underline">Fermer</button>
            <div className="bg-black rounded-md overflow-hidden">
              <Image src={current.src} alt={current.alt} width={1600} height={1000} className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
