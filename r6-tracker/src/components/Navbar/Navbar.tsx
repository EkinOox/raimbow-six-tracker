'use client';

// Navbar component avec design glassmorphisme R6
// Encodage: UTF-8

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Accueil', href: '/', icon: 'pi-home' },
  { label: 'Recherche', href: '/search', icon: 'pi-search' },
  { label: 'Dashboard', href: '/dashboard', icon: 'pi-chart-bar' },
  { label: 'Comparaison', href: '/comparison', icon: 'pi-arrow-right-arrow-left' },
  { label: 'Opérateurs', href: '/operators', icon: 'pi-users' },
  { label: 'Cartes', href: '/maps', icon: 'pi-map' },
  { label: 'API Test', href: '/api-test', icon: 'pi-cog' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Détecter le scroll pour l'effet glassmorphisme
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-glass-bg-dark/80 backdrop-blur-glass border-b border-glass-border-dark' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-r6 rounded-lg flex items-center justify-center">
                <i className="pi pi-shield text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-r6-light">
                R6 <span className="text-r6-primary">Tracker</span>
              </span>
            </Link>
          </motion.div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                      isActive
                        ? 'text-r6-primary bg-r6-primary/10'
                        : 'text-r6-light/80 hover:text-r6-light hover:bg-glass-bg/50'
                    }`}
                  >
                    <i className={`pi ${item.icon} text-sm`}></i>
                    <span>{item.label}</span>
                    
                    {/* Indicateur de page active */}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-r6-primary rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {/* Effet glow au hover */}
                    <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                    } bg-r6-primary/10 -z-10`} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Bouton Menu Mobile */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-r6-light hover:text-r6-primary hover:bg-glass-bg/50 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-current mb-1.5 origin-center transition-transform"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block w-6 h-0.5 bg-current mb-1.5"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="block w-6 h-0.5 bg-current origin-center transition-transform"
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-glass-bg-dark/90 backdrop-blur-glass border-t border-glass-border-dark"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href;
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-r6-primary bg-r6-primary/10 border-l-2 border-r6-primary'
                          : 'text-r6-light/80 hover:text-r6-light hover:bg-glass-bg/50'
                      }`}
                    >
                      <i className={`pi ${item.icon} text-lg`}></i>
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}