"use client";

// Page d'accueil R6 Tracker
// Encodage: UTF-8

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useTranslations } from 'next-intl';
import YouTubeLite from "@/components/YouTubeLite";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export default function HomePage() {
  const t = useTranslations('home');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const features = [
    {
      icon: "pi-search",
      title: t('features.advancedSearch.title'),
      description: t('features.advancedSearch.description'),
      href: "/search",
    },
    {
      icon: "pi-chart-bar",
      title: t('features.detailedStats.title'),
      description: t('features.detailedStats.description'),
      href: "/dashboard-new",
    },
    {
      icon: "pi-arrow-right-arrow-left",
      title: t('features.comparison.title'),
      description: t('features.comparison.description'),
      href: "/comparaison",
    },
    {
      icon: "pi-users",
      title: t('features.operators.title'),
      description: t('features.operators.description'),
      href: "/operators",
    },
    {
      icon: "pi-shield",
      title: t('features.weapons.title'),
      description: t('features.weapons.description'),
      href: "/weapons",
    },
    {
      icon: "pi-map",
      title: t('features.maps.title'),
      description: t('features.maps.description'),
      href: "/maps",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-20 lg:py-32 overflow-hidden"
      >
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <Image
            src="/images/img/accueil-hero.png"
            alt="R6 Background"
            fill
            sizes="100vw"
            className="object-cover opacity-100"
            priority
            fetchPriority="high"
            quality={100}
            unoptimized={false}
          />
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo principal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-r6 rounded-2xl shadow-r6-glow opacity-80"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/20 p-2">
                  <Image
                    src="/images/logo/r6x-logo-ww.avif"
                    alt="R6 Tracker Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    priority
                    fetchPriority="high"
                    quality={60}
                  />
                </div>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-r6-light mb-4">
                {t('hero.title')} <span className="text-r6-primary">{t('hero.titleHighlight')}</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl lg:text-2xl text-r6-light/80 mb-8 max-w-3xl mx-auto"
            >
              {t('hero.description')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-r6 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-r6-glow"
              >
                <i className="pi pi-search mr-2"></i>
                {t('hero.cta.search')}
              </Link>
              <Link
                href="/dashboard-new"
                className="inline-flex items-center justify-center px-8 py-4 bg-glass-bg/20 backdrop-blur-sm border border-glass-border/30 text-r6-light font-semibold rounded-xl hover:border-r6-primary/50 hover:scale-105 transition-all duration-200"
              >
                <i className="pi pi-chart-bar mr-2"></i>
                {t('hero.cta.dashboard')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Video Presentation Section */}
      <section className="bg-gradient-to-r from-r6-primary/5 to-r6-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/img/presentation-r6.png"
                  alt="Rainbow Six Siege Gameplay"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover"
                  quality={70}
                  loading="lazy"
                />
              </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 lg:order-2 text-center lg:text-left"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-6">
                {t('presentation.title')}
              </h2>
              <p className="text-lg text-r6-light/70 mb-8 leading-relaxed">
                {t('presentation.description')}
              </p>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-r6 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-r6-glow"
              >
                <i className="pi pi-search mr-2"></i>
                {t('presentation.cta')}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full mb-12"
      >
        <div className="my-20 max-w-5xl mx-auto">
          <div className="relative w-full aspect-video bg-black/20 overflow-hidden shadow-2xl rounded-2xl">
            <YouTubeLite
              videoId="BI9fgQY0d5I"
              title="Rainbow Six Siege - Présentation Officielle"
              autoplay={false}
              muted={true}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Features Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
              {t('features.description')}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.href}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Link href={feature.href}>
                  <div className="card-glass liquid-glass liquid-glass-hover group-hover:border-r6-primary/50 h-full">
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-r6-primary/20 to-r6-accent/20 flex items-center justify-center">
                      <i
                        className={`pi ${feature.icon} text-6xl text-r6-primary group-hover:text-r6-accent group-hover:scale-110 transform transition-all duration-300`}
                      ></i>
                    </div>
                    <div className="w-12 h-12 bg-r6-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-r6-primary/30 transition-colors">
                      <i
                        className={`pi ${feature.icon} text-r6-primary text-xl`}
                      ></i>
                    </div>
                    <h3 className="text-xl font-semibold text-r6-light mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-r6-light/70 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-r6-primary font-medium group-hover:text-r6-accent transition-colors">
                      <span>{t('features.learnMore')}</span>
                      <i className="pi pi-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-gradient-to-r from-r6-primary/10 to-r6-accent/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
              {t('video.title')}
            </h2>
            <p className="text-lg text-r6-light/70 max-w-2xl mx-auto">
              {t('video.description')}
            </p>
          </motion.div>
          {/* Demo Video - Season Current */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-r6-light text-center mb-6">
              {t('video.seasonDemo')}
            </h3>
            <div className="relative aspect-video bg-black/20 rounded-2xl overflow-hidden shadow-2xl">
              <YouTubeLite
                videoId="iqdhOZs9PmQ"
                title="R6 Tracker Demo Saison"
                autoplay={false}
                muted={false}
                className="rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-glass liquid-glass liquid-glass-hover"
          >
            <div className="py-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-r6-light mb-4">
                {t('finalCta.title')}
              </h2>
              <p className="text-lg text-r6-light/70 mb-8">
                {t('finalCta.description')}
              </p>
              <Link
                href="/search"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-r6 text-white font-semibold rounded-xl hover:scale-105 transition-transform duration-200 shadow-r6-glow"
              >
                <i className="pi pi-play mr-2"></i>
                {t('finalCta.button')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
