import type { NextAuthConfig } from 'next-auth';
import i18nConfig from './i18n.config';
import { i18nRouter } from 'next-i18n-router';

const getLocaleFromPath = (pathname: string) => {
  const localeFromPathRegex = new RegExp(`^/(${i18nConfig.locales.join('|')})?`)
  const localeFromPath = pathname.match(localeFromPathRegex)?.[1]
  return { locale: localeFromPath, path: localeFromPath ? `/${localeFromPath}` : '' }
}

const checkCurrentRoute = (pathname: string, locale?: string) => {
  const checkPathnameRegex = (pattern: string | RegExp) => {
    const rootRegex = new RegExp(pattern)
    return Boolean(pathname.match(rootRegex))
  }

  return {
    IsOnLogin: checkPathnameRegex(`^/(${locale})?$`),
    isOnDashboard: checkPathnameRegex(`^(/${locale})?/dashboard.*`)
  }
}

export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request }) {
      const nextUrl = request.nextUrl;
      const locale = getLocaleFromPath(nextUrl.pathname);
      const dashboardUrl = new URL(`${locale.path}/dashboard`, nextUrl);
      const logindUrl = new URL(`${locale.path}/`, nextUrl);
      const { IsOnLogin, isOnDashboard} = checkCurrentRoute(nextUrl.pathname, locale.locale);

      const isLoggedIn = !!auth?.user;
      if (isLoggedIn && !isOnDashboard) {
        // If on root or logged in but not on dashboard, redirect to dashboard
        return Response.redirect(dashboardUrl);
      }

      if (isLoggedIn && isOnDashboard) {
        // Not logged in but on login OR logged in and on dashboard => allow access
        return i18nRouter(request, i18nConfig);
      }
      if(!isLoggedIn && IsOnLogin){
        // Not logged in and on login => allow access
        return i18nRouter(request, i18nConfig);
      }
      if(!isLoggedIn && !IsOnLogin){
        // Not logged in and not on login => redirect to login
        return Response.redirect(logindUrl);
      }
      return false;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  providers: [],
} satisfies NextAuthConfig;