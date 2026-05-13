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

// Read the iia_lang cookie strictly from the INCOMING request headers — not via
// context.cookies.get(), which also returns cookies set earlier in the same request.
// During a rewrite from /fr/* to /*, pass 1 sets cookie=fr; pass 2's cookies.get()
// would see that fresh value and loop the redirect. This avoids the leak.
function readIncomingCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  const re = new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]+)`);
  const m = re.exec(header);
  return m ? decodeURIComponent(m[1]) : undefined;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context;
  const pathname = url.pathname;
  const explicitFrench = pathname === '/fr' || pathname === '/fr/' || pathname.startsWith('/fr/');
  const pagePath = stripLocalePrefix(pathname);

  context.locals.originalPathname = pathname;
  context.locals.pagePath = pagePath;

  // If a prior middleware pass in this request already pinned the locale (we are
  // inside a rewrite from /fr/*), just render — do not re-evaluate redirects.
  if (context.locals.locale === 'fr' || context.locals.locale === 'en') {
    return next();
  }

  if (explicitFrench) {
    context.locals.locale = 'fr';
    cookies.set('iia_lang', 'fr', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return context.rewrite(pagePath + url.search);
  }

  const incomingCookieLocale = readIncomingCookie(context.request, 'iia_lang');
  const preferredLocale = detectLocale(context.request, incomingCookieLocale);
  context.locals.locale = 'en';

  if (!isSkippablePath(pathname) && preferredLocale === 'fr') {
    cookies.set('iia_lang', 'fr', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return context.redirect(withLocale(pathname, 'fr') + url.search, 302);
  }

  cookies.set('iia_lang', 'en', { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return next();
});
