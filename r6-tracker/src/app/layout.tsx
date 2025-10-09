import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout/Layout";
import { ReduxProvider } from "../store/ReduxProvider";

export const metadata: Metadata = {
  title: "R6 Tracker - Rainbow Six Siege Statistics",
  description: "Suivez vos statistiques Rainbow Six Siege avec style. Interface moderne et données en temps réel.",
  keywords: ["Rainbow Six Siege", "R6", "Statistiques", "Tracker", "Gaming"],
  authors: [{ name: "R6 Tracker Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "R6 Tracker - Rainbow Six Siege Statistics",
    description: "Suivez vos statistiques Rainbow Six Siege avec style",
    type: "website",
    images: [
      {
        url: "/images/logo/r6-logo.png",
        width: 1200,
        height: 630,
        alt: "R6 Tracker Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "R6 Tracker - Rainbow Six Siege Statistics",
    description: "Suivez vos statistiques Rainbow Six Siege avec style",
    images: ["/images/logo/r6-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/primeicons@7.0.0/primeicons.css" 
        />
      </head>
      <body className="antialiased">
        <ReduxProvider>
          <Layout>
            {children}
          </Layout>
        </ReduxProvider>
      </body>
    </html>
  );
}
