import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { i18nRouter } from 'next-i18n-router';
import { NextRequest } from 'next/server';
import i18nConfig from './i18n.config';


export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    '/((?!_next/static|_next/image|.*\\.png$|banlist\\.txt|favicon.ico|test).*)',
  ],
};
