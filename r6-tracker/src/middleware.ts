import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

// Créer le middleware i18n uniquement
// NextAuth gère l'authentification via ses propres mécanismes
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default intlMiddleware;

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};
