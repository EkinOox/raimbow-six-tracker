'use client';

// Composant en-tête de section avec logo R6
// Encodage: UTF-8

import { motion } from 'framer-motion';
import Image from 'next/image';

interface SectionHeaderProps {
  title: string;
  description: string;
  icon?: string;
  useLogo?: boolean;
  className?: string;
}

export default function SectionHeader({ 
  title, 
  description, 
  icon = 'pi-star',
  useLogo = false,
  className = '' 
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center mb-12 ${className}`}
    >
      <div className="relative w-16 h-16 mx-auto mb-6">
        {useLogo ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-r6 rounded-2xl shadow-r6-glow opacity-90"></div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 p-2">
              <Image
                src="/images/logo/r6-logo.png"
                alt="R6 Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-r6 rounded-2xl flex items-center justify-center shadow-r6-glow">
            <i className={`pi ${icon} text-white text-2xl`}></i>
          </div>
        )}
      </div>
      
      <h1 className="text-4xl font-bold text-r6-light mb-4">
        {title}
      </h1>
      
      <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
}