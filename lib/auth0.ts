import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { NextResponse } from 'next/server';

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.APP_BASE_URL,
  authorizationParameters: {
    redirect_uri: `${process.env.APP_BASE_URL}/auth/callback`,
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email offline_access', 
  },
  allowInsecureRequests: true,
   async onCallback(error, context, session) {
    if (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(
        new URL('/error?authentication=true', process.env.APP_BASE_URL)
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

const backendUrl = process.env.SIRIUS_BACKEND_URL ?? "http://localhost:8000";

/**
 * Creates an authenticated fetcher instance for making requests to the Sirius backend.
 * 
 * This fetcher automatically handles:
 * - Access token retrieval and injection
 * - Token refresh if needed
 * - Authorization headers
 * 
 * @example
 * ```typescript
 * const fetcher = await createBackendFetcher();
 * const response = await fetcher.fetchWithAuth("/projects");
 * const data = await response.json();
 * ```
 */
export async function createBackendFetcher() {
  return auth0.createFetcher(undefined, {
    baseUrl: backendUrl
  });
}