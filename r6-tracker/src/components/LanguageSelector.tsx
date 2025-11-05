'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';
import { useTransition } from 'react';

export default function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  
  // Extract current locale from pathname
  // Check if pathname starts with /fr or /en, otherwise default to 'fr'
  const getCurrentLocale = () => {
    for (const loc of locales) {
      if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
        return loc;
      }
    }
    return 'fr'; // Default locale
  };
  
  const currentLocale = getCurrentLocale();

  const handleLanguageChange = (newLocale: string) => {
    if (isPending || currentLocale === newLocale) return;
    
    startTransition(() => {
      // Remove current locale from pathname if present
      const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';
      // Navigate to new locale
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleLanguageChange(loc)}
          disabled={isPending}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
            ${currentLocale === loc 
              ? 'bg-gradient-r6 text-white shadow-r6-glow' 
              : 'bg-glass-bg/20 text-r6-light/70 hover:bg-glass-bg/30 hover:text-r6-light border border-glass-border/30'
            }
            ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
