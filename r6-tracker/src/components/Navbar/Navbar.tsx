'use client';

// Navbar component avec design glassmorphisme R6 + Auth + Liquid Glass
// Dashboard accessible uniquement via le menu profil
// Encodage: UTF-8

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LanguageSelector from '../LanguageSelector';

interface NavItem {
  labelKey: string;
  href: string;
  icon: string;
}

// Navigation principale - Dashboard retirée (accessible via profil uniquement)
const navItems: NavItem[] = [
  { labelKey: 'nav.home', href: '/', icon: 'pi-home' },
  { labelKey: 'nav.search', href: '/search', icon: 'pi-search' },
  { labelKey: 'nav.comparison', href: '/comparaison', icon: 'pi-arrow-right-arrow-left' },
  { labelKey: 'nav.operators', href: '/operators', icon: 'pi-users' },
  { labelKey: 'nav.weapons', href: '/weapons', icon: 'pi-bookmark' },
  { labelKey: 'nav.maps', href: '/maps', icon: 'pi-map' },
  { labelKey: 'nav.about', href: '/about', icon: 'pi-info-circle' },
];

export default function Navbar() {
  const t = useTranslations();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  // Détecter le scroll pour l'effet glassmorphisme - Optimisé avec passive listener et throttle
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // Effet liquid glass - suivre la souris - Optimisé avec throttle
  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Déconnexion avec NextAuth - efface automatiquement tous les cookies
      await signOut({ 
        redirect: false,
        callbackUrl: '/' 
      });
      setShowUserMenu(false);
      
      // Redirection vers l'accueil après déconnexion
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // En cas d'erreur, forcer la redirection quand même
      setShowUserMenu(false);
      router.push('/');
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-glass-bg-dark/50 backdrop-blur-sm animate-in slide-in-from-top ${
        isScrolled 
          ? 'border-b border-glass-border-dark/50 shadow-glass' 
          : ''
      }`}
      style={{ animation: 'slideDown 0.5s ease-out' }}
    >
      {/* Effet Liquid Glass - Gradient animé qui suit la souris */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-all duration-200"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(255, 169, 0, 0.08), 
            rgba(255, 69, 0, 0.05), 
            transparent 80%)`
        }}
      />
      


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gradient-r6 p-1">
                <Image
                  src="/images/logo/r6x-logo-ww.avif"
                  alt="R6 Tracker Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                  quality={90}
                  sizes="40px"
                />
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
                        ? 'text-r6-primary bg-r6-primary/10 backdrop-blur-md'
                        : 'text-r6-light/80 hover:text-r6-light hover:bg-glass-bg/50 hover:backdrop-blur-md'
                    }`}
                  >
                    <i className={`pi ${item.icon} text-sm`}></i>
                    <span>{t(item.labelKey)}</span>
                    
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

            {/* Sélecteur de langue */}
            <div className="ml-2">
              <LanguageSelector />
            </div>

            {/* Auth unique - Connexion ou Menu Profil */}
            <div className="ml-4">
              {isAuthenticated && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-glass-bg/50 backdrop-blur-md hover:bg-glass-bg hover:backdrop-blur-glass text-r6-light border border-glass-border-dark transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-r6 flex items-center justify-center">
                      <i className="pi pi-user text-xs text-white"></i>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-r6-light/60">Profil</span>
                      <span className="text-sm font-medium text-r6-light">{user.name || user.email}</span>
                    </div>
                    <i className={`pi pi-chevron-down text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
                  </motion.button>

                  {/* Dropdown Menu Profil */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 rounded-lg shadow-glass overflow-visible z-[100]"
                        style={{ maxHeight: '80vh', overflowY: 'auto' }}
                      >
                        {/* Conteneur avec effet liquid glass */}
                        <div className="relative bg-glass-bg-dark/95 backdrop-blur-glass border border-glass-border-dark rounded-lg overflow-hidden shadow-glass">
                          {/* Effet Liquid Glass pour le menu */}
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <motion.div
                              className="absolute w-full h-full"
                              animate={{
                                background: `radial-gradient(400px circle at 50% 30%, 
                                  rgba(255, 169, 0, 0.06), 
                                  rgba(255, 69, 0, 0.03), 
                                  transparent 70%)`,
                              }}
                              transition={{ type: 'tween', ease: 'linear', duration: 0.3 }}
                            />
                          </div>

                          {/* Header Profil */}
                          <div className="relative px-4 py-3 bg-gradient-r6/10 border-b border-glass-border-dark z-10">
                            <p className="text-xs text-r6-light/60 mb-1">Connecté en tant que</p>
                            <p className="text-sm font-bold text-r6-light">{user.name || user.email}</p>
                            {user.email && (
                              <p className="text-xs text-r6-light/60 mt-0.5">{user.email}</p>
                            )}
                            {user.uplayProfile && (
                              <div className="mt-2 flex items-center space-x-2">
                                <i className="pi pi-user-edit text-xs text-r6-primary"></i>
                                <p className="text-xs text-r6-primary font-medium">Uplay: {user.uplayProfile}</p>
                              </div>
                            )}
                          </div>

                          {/* Dashboard - Accès principal */}
                          <Link
                            href="/dashboard-new"
                            onClick={() => setShowUserMenu(false)}
                            className="relative block px-4 py-3 text-sm text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-xl hover:text-r6-primary transition-colors border-b border-glass-border-dark z-10"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="pi pi-chart-bar text-base"></i>
                              <div>
                                <p className="font-medium">{t('nav.myDashboard')}</p>
                                <p className="text-xs text-r6-light/60">Stats Uplay & Favoris</p>
                              </div>
                            </div>
                          </Link>

                          {/* Modifier mon profil */}
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="relative block px-4 py-3 text-sm text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-xl hover:text-r6-primary transition-colors border-b border-glass-border-dark z-10"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="pi pi-user-edit text-base"></i>
                              <div>
                                <p className="font-medium">{t('nav.editProfile')}</p>
                                <p className="text-xs text-r6-light/60">Gérer mon compte</p>
                              </div>
                            </div>
                          </Link>

                          {/* Profil R6 Stats */}
                          {user.uplayProfile && (
                            <Link
                              href={`/profile/${user.uplayProfile}`}
                              onClick={() => setShowUserMenu(false)}
                              className="relative block px-4 py-3 text-sm text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-xl hover:text-r6-primary transition-colors z-10"
                            >
                              <div className="flex items-center space-x-3">
                                <i className="pi pi-id-card text-base"></i>
                                <div>
                                  <p className="font-medium">Profil R6</p>
                                  <p className="text-xs text-r6-light/60">Voir mes stats R6</p>
                                </div>
                              </div>
                            </Link>
                          )}                          {/* Séparateur */}
                          <div className="border-t border-glass-border-dark"></div>

                          {/* Déconnexion */}
                          <button
                            onClick={handleLogout}
                            className="relative w-full px-4 py-3 text-sm text-left text-red-400 hover:bg-red-500/10 hover:backdrop-blur-xl transition-colors flex items-center space-x-3 z-10"
                          >
                            <i className="pi pi-sign-out text-base"></i>
                            <span className="font-medium">{t('nav.logout')}</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-r6 text-white hover:shadow-lg hover:shadow-r6-primary/30 transition-all"
                >
                  <i className="pi pi-user text-sm"></i>
                  <span className="text-sm font-medium">{t('nav.login')}</span>
                </Link>
              )}
            </div>
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
            className="md:hidden relative"
          >
            {/* Conteneur avec effet liquid glass */}
            <div className="relative bg-glass-bg-dark/95 backdrop-blur-glass border-t border-glass-border-dark overflow-hidden shadow-glass">
              {/* Effet Liquid Glass pour le menu mobile */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute w-full h-full"
                  animate={{
                    background: `radial-gradient(500px circle at 50% 20%, 
                      rgba(255, 169, 0, 0.06), 
                      rgba(255, 69, 0, 0.03), 
                      transparent 70%)`,
                  }}
                  transition={{ type: 'tween', ease: 'linear', duration: 0.3 }}
                />
              </div>

            <div className="relative px-4 py-3 space-y-1 z-10">
              {/* Navigation Links */}
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
                          ? 'text-r6-primary bg-r6-primary/10 backdrop-blur-md border-l-2 border-r6-primary'
                          : 'text-r6-light/80 hover:text-r6-light hover:bg-glass-bg/50 hover:backdrop-blur-md'
                      }`}
                    >
                      <i className={`pi ${item.icon} text-lg`}></i>
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Auth Section Mobile */}
              <div className="pt-4 mt-4 border-t border-glass-border-dark">
                {/* Sélecteur de langue mobile */}
                <div className="mb-4 px-3">
                  <p className="text-xs text-r6-light/60 mb-2">{t('nav.language')}</p>
                  <LanguageSelector />
                </div>
                
                {isAuthenticated && user ? (
                  <>
                    {/* Profil Header */}
                    <div className="px-3 py-2 mb-3 bg-gradient-r6/10 rounded-lg">
                      <p className="text-xs text-r6-light/60 mb-1">Profil</p>
                      <p className="text-sm font-bold text-r6-light">{user.name || user.email}</p>
                      {user.email && (
                        <p className="text-xs text-r6-light/60">{user.email}</p>
                      )}
                      {user.uplayProfile && (
                        <p className="text-xs text-r6-primary mt-1">
                          <i className="pi pi-user-edit mr-1"></i>
                          Uplay: {user.uplayProfile}
                        </p>
                      )}
                    </div>

                    {/* Dashboard */}
                    <Link
                      href="/dashboard-new"
                      className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg text-base font-medium text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-md hover:text-r6-primary transition-all"
                    >
                      <i className="pi pi-chart-bar text-lg"></i>
                      <div>
                        <p className="text-sm font-medium">{t('nav.dashboard')}</p>
                        <p className="text-xs text-r6-light/60">Stats & Favoris</p>
                      </div>
                    </Link>

                    {/* Modifier mon profil */}
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg text-base font-medium text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-md hover:text-r6-primary transition-all"
                    >
                      <i className="pi pi-user-edit text-lg"></i>
                      <div>
                        <p className="text-sm font-medium">{t('nav.profile')}</p>
                        <p className="text-xs text-r6-light/60">Gérer mon compte</p>
                      </div>
                    </Link>

                    {/* Profil Uplay */}
                    {user.uplayProfile && (
                      <Link
                        href={`/profile/${user.uplayProfile}`}
                        className="flex items-center space-x-3 px-3 py-2 mb-2 rounded-lg text-base font-medium text-r6-light hover:bg-r6-primary/10 hover:backdrop-blur-md hover:text-r6-primary transition-all"
                      >
                        <i className="pi pi-id-card text-lg"></i>
                        <div>
                          <p className="text-sm font-medium">Profil Uplay</p>
                          <p className="text-xs text-r6-light/60">Mes stats R6</p>
                        </div>
                      </Link>
                    )}

                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 mt-3 pt-3 border-t border-glass-border-dark rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10 hover:backdrop-blur-md transition-all"
                    >
                      <i className="pi pi-sign-out text-lg"></i>
                      <span>{t('nav.logout')}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-base font-medium bg-gradient-r6 text-white hover:shadow-lg transition-all"
                  >
                    <i className="pi pi-user"></i>
                    <span>{t('nav.login')}</span>
                  </Link>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
