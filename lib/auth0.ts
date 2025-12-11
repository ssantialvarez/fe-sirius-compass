import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.APP_BASE_URL,
  authorizationParameters: {
    redirect_uri: `${process.env.APP_BASE_URL}/auth/callback`, 
  },
   async onCallback(error, context, session) {
    if (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(
        new URL('/error', process.env.APP_BASE_URL)
      );
    }

    // Custom logic after successful authentication
    if (session) {
      console.log(`User ${session.user.sub} logged in successfully`);
    }

    return NextResponse.redirect(
      new URL(context.returnTo || "/connections", process.env.APP_BASE_URL)
    );
  }
});