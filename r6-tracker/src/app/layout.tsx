import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout/Layout";
import { ReduxProvider } from "../store/ReduxProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: {
    default: "Rainbow Six Tracker - Statistiques Rainbow Six Siege en Temps Réel",
    template: "%s | Rainbow Six Tracker"
  },
  description: "Rainbow Six Tracker : Suivez vos statistiques Rainbow Six Siege en temps réel. API Rainbow Six Siege complète pour consulter vos stats, opérateurs, armes et cartes. Le meilleur tracker R6 gratuit.",
  keywords: [
    "rainbow six tracker",
    "rainbow six siege tracker",
    "statistique rainbow six siege",
    "statistiques rainbow six siege",
    "api rainbow six siege",
    "r6 tracker",
    "r6 stats",
    "rainbow six stats",
    "rainbow six siege stats",
    "tracker rainbow six",
    "rainbow six siege statistiques",
    "suivi stats r6",
    "rainbow six api",
    "r6 siege tracker",
    "rainbow six leaderboard",
    "r6 opérateurs",
    "rainbow six armes",
    "rainbow six cartes"
  ],
  authors: [{ name: "Rainbow Six Tracker Team" }],
  creator: "Rainbow Six Tracker",
  publisher: "Rainbow Six Tracker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    siteName: "Rainbow Six Tracker",
    title: "Rainbow Six Tracker - Statistiques Rainbow Six Siege & API",
    description: "Tracker Rainbow Six Siege complet : statistiques en temps réel, API Rainbow Six Siege, opérateurs, armes et cartes. Suivez vos performances R6.",
    images: [
      {
        url: "/images/logo/r6-logo.png",
        width: 1200,
        height: 630,
        alt: "Rainbow Six Tracker - Statistiques R6 Siege",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@R6Tracker",
    creator: "@R6Tracker",
    title: "Rainbow Six Tracker - Stats Rainbow Six Siege",
    description: "Suivez vos statistiques Rainbow Six Siege avec notre tracker gratuit. API R6 complète.",
    images: ["/images/logo/r6-logo.png"],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Rainbow Six Tracker',
    description: 'Tracker Rainbow Six Siege complet avec statistiques en temps réel et API Rainbow Six Siege',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    applicationCategory: 'Game',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    author: {
      '@type': 'Organization',
      name: 'Rainbow Six Tracker Team',
    },
    keywords: 'rainbow six tracker, statistique rainbow six siege, api rainbow six siege, r6 stats, tracker r6',
  };

  return (
    <html lang="fr">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/primeicons@7.0.0/primeicons.css" 
        />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ''} />
        <meta name="theme-color" content="#ff3d2c" />
      </head>
      <body className="antialiased">
        {/* Particules de cendre en fond */}
        <div className="ash-particles">
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          <div className="ash-particle"></div>
          {/* Particules de bois brûlé */}
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
          <div className="ember-particle"></div>
        </div>
        <ReduxProvider>
          <Layout>
            {children}
          </Layout>
        </ReduxProvider>
      </body>
    </html>
  );
}
