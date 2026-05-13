import { defineMiddleware } from 'astro:middleware';
import { detectLocale, stripLocalePrefix, withLocale } from './lib/i18n';

function isSkippablePath(pathname: string): boolean {
  return pathname.startsWith('/api/')
    || pathname.startsWith('/_astro/')
    || pathname.startsWith('/icons/')
    || pathname.startsWith('/og-card/')
    || pathname.startsWith('/field/')
    || pathname.startsWith('/diagrams/')
    || pathname === '/favicon.ico'
    || pathname === '/favicon.svg'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/robots.txt'
    || pathname === '/site.webmanifest'
    || pathname === '/1baec1800ff87165e359487aad399c44.txt'
    || /\.[a-z0-9]+$/i.test(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;
  const explicitFrench = pathname === '/fr' || pathname === '/fr/' || pathname.startsWith('/fr/');
  const pagePath = stripLocalePrefix(pathname);

  context.locals.originalPathname = pathname;
  context.locals.pagePath = pagePath;

  if (explicitFrench) {
    context.locals.locale = 'fr';
    cookies.set('iia_lang', 'fr', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return context.rewrite(pagePath + url.search);
  }

  const preferredLocale = detectLocale(context.request, cookies.get('iia_lang')?.value);
  context.locals.locale = 'en';

  if (!isSkippablePath(pathname) && preferredLocale === 'fr') {
    cookies.set('iia_lang', 'fr', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return context.redirect(withLocale(pathname, 'fr') + url.search, 302);
  }

  cookies.set('iia_lang', 'en', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return next();
});
