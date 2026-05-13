export const DEFAULT_LOCALE = 'en' as const;
export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const FRENCH_COUNTRIES = new Set([
  // Europe + North America
  'FR', 'BE', 'CH', 'LU', 'MC', 'CA',
  // French overseas territories / departments
  'GF', 'GP', 'MQ', 'RE', 'YT', 'NC', 'PF', 'BL', 'MF', 'PM', 'WF',
  // West Africa (Francophone)
  'SN', 'ML', 'BF', 'NE', 'CI', 'GN', 'BJ', 'TG', 'MR',
  // Central Africa (Francophone)
  'CM', 'CF', 'TD', 'CG', 'CD', 'GA', 'GQ',
  // North Africa (Maghreb)
  'DZ', 'TN', 'MA',
  // East Africa / Indian Ocean (Francophone)
  'DJ', 'KM', 'MG', 'RW', 'BI',
  // Other Francophone
  'HT', 'VU', 'SC'
]);

export function normalizeLocale(value: string | null | undefined): Locale {
  return value?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function isFrenchCountry(value: string | null | undefined): boolean {
  return value ? FRENCH_COUNTRIES.has(value.toUpperCase()) : false;
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/fr' || pathname === '/fr/') return '/';
  if (pathname.startsWith('/fr/')) return pathname.slice(3);
  return pathname;
}

export function withLocale(pathname: string, locale: Locale): string {
  const clean = pathname === '' ? '/' : pathname;
  if (locale === 'en') return clean;
  if (clean === '/') return '/fr/';
  return `/fr${clean}`;
}

export function detectLocale(request: Request, cookieLocale?: string | null): Locale {
  // 1. Explicit cookie always wins — the user has chosen.
  const explicit = normalizeLocale(cookieLocale);
  if (cookieLocale === 'fr' || cookieLocale === 'en') return explicit;

  const headers = request.headers;
  const acceptLanguage = headers.get('accept-language');

  // 2. Explicit Accept-Language preference (browser/OS choice) takes priority over geo.
  //    This is what stops an English-Canadian or English-Cameroonian from being silently
  //    redirected to /fr/ just because the country happens to be on the Francophone list.
  if (acceptLanguage) {
    const langs = acceptLanguage.toLowerCase();
    // Pull the first non-wildcard preference; "*" / "und" don't count as explicit.
    const firstPref = langs.split(',')[0]?.split(';')[0]?.trim();
    if (firstPref && firstPref !== '*' && firstPref !== 'und') {
      if (firstPref.startsWith('fr')) return 'fr';
      if (firstPref.startsWith('en')) return 'en';
      // Some other primary language — fall through to geo (e.g., Arabic-speaking
      // Algerian user with ar-DZ; geo will route them to /fr/ since DZ is a
      // Francophone-administered country and French is the lingua franca of the
      // local industrial sector).
    }
  }

  // 3. Geo header fallback when no explicit language preference. Order of header
  //    inspection covers the common edge / proxy / CDN injections.
  const country =
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    headers.get('x-country-code') ??
    headers.get('x-geo-country') ??
    headers.get('cloudfront-viewer-country');

  if (isFrenchCountry(country)) return 'fr';

  // 4. Last-resort Accept-Language scan for any French tag anywhere (e.g.,
  //    "en-US,fr;q=0.5" where French is a secondary preference).
  if (acceptLanguage && /(^|,|;)\s*fr([-_][A-Z]{2})?/i.test(acceptLanguage)) {
    return 'fr';
  }

  return 'en';
}

export function localizeLabel(locale: Locale, en: string, fr: string): string {
  return locale === 'fr' ? fr : en;
}
