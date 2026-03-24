import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['pt', 'en', 'es'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export const config = {
  matcher: ['/((?!api|admin|formulario|auth|_next|.*\\..*).*)'],
};
