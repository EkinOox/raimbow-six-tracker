import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If not valid, use the default locale from config instead of throwing
  const validatedLocale = (locale && locales.includes(locale as Locale)) 
    ? locale as Locale
    : defaultLocale;

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default
  };
});
