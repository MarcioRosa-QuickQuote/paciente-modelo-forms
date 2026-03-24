import { getRequestConfig } from 'next-intl/server';

const locales = ['pt', 'en', 'es'] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback to default locale if not set or invalid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'pt';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
