import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './lib/i18n/config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  // Always land on the default locale (bg) regardless of the visitor's
  // Accept-Language header. Users can still switch to EN via the header.
  localeDetection: false,
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
