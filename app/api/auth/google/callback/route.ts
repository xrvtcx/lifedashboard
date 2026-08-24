import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { googleOAuthTokens } from '@/db/schema';
import { exchangeCodeForToken } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`/?error=Google auth failed`);
  }

  if (!code) {
    return NextResponse.redirect(`/?error=No authorization code`);
  }

  try {
    const { access_token, refresh_token, expires_in } = await exchangeCodeForToken(code);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Delete any existing token (we're single-user), then insert the new one
    await db.delete(googleOAuthTokens);
    await db.insert(googleOAuthTokens).values({ accessToken: access_token, refreshToken: refresh_token, expiresAt });

    return NextResponse.redirect(`/?success=Google Calendar connected`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`/?error=Authentication failed`);
  }
}
