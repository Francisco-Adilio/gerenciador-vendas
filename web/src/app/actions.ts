'use server';

import { cookies } from 'next/headers';
import { apiFetch } from './lib/api';

export interface LoginState {
  success?: boolean;
  error?: string | null;
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  try {
    const response = await apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ name: 'Francisco', password: 'falfal' }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        error: data.message || 'Credenciais inválidas ou erro no servidor.' 
      };
    }

    const cookieStore = await cookies();
    cookieStore.set('session_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    return { success: true, error: null };

  } catch (err) {
    console.error(err)
    return { 
      success: false, 
      error: 'Não foi possível conectar ao servidor de autenticação.' 
    };
  }
}
