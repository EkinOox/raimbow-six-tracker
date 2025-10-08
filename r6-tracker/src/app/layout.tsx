import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout/Layout";

export const metadata: Metadata = {
  title: "R6 Tracker - Rainbow Six Siege Statistics",
  description: "Suivez vos statistiques Rainbow Six Siege avec style. Interface moderne et données en temps réel.",
  keywords: ["Rainbow Six Siege", "R6", "Statistiques", "Tracker", "Gaming"],
  authors: [{ name: "R6 Tracker Team" }],
  openGraph: {
    title: "R6 Tracker - Rainbow Six Siege Statistics",
    description: "Suivez vos statistiques Rainbow Six Siege avec style",
    type: "website",
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
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
