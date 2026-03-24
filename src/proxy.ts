import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['pt', 'en', 'es'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed', // pt is at /, en at /en/, es at /es/
});

export const config = {
  matcher: ['/((?!api|admin|formulario|auth|_next|.*\\..*).*)'],
};
