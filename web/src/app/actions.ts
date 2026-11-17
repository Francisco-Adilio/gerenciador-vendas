'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from './lib/api';
import { LAST_EVENT_COOKIE } from './lib/constants';

export interface LoginState {
  success?: boolean;
  error?: string | null;
  redirectTo?: string;
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  try {
    const response = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      return { success: false, error: 'Usuário ou senha inválidos.' };
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('session_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    // Go straight to the checkout of the last event used on this device
    const lastEvent = cookieStore.get(LAST_EVENT_COOKIE)?.value;
    return { success: true, error: null, redirectTo: lastEvent ? `/eventos/${lastEvent}` : '/eventos' };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Não foi possível conectar ao servidor de autenticação.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  redirect('/');
}
