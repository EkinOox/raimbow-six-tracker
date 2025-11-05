import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import Layout from '@/components/Layout/Layout';
import { ReduxProvider } from '@/store/ReduxProvider';
import { AuthProvider } from '@/components/AuthProvider';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params as required by Next.js 15
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Getting messages for the locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <ReduxProvider>
          <Layout>
            {children}
          </Layout>
        </ReduxProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
