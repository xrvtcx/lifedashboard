'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, computeSessionToken } from '@/lib/session';

export async function login(formData: FormData) {
  const password = String(formData.get('password') || '');
  const from = String(formData.get('from') || '/');
  const appPassword = process.env.APP_PASSWORD || '';

  if (!appPassword || password !== appPassword) {
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const token = await computeSessionToken(process.env.SESSION_SECRET || '', appPassword);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  redirect(from || '/');
}

export async function logout() {
  cookies().delete(SESSION_COOKIE);
  redirect('/login');
}
