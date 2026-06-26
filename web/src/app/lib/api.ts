import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Função reutilizável para pegar o token
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session_token')?.value || null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  // Configura os headers padrões e injeta o token se ele existir
  const headers = new Headers(options.headers);
  
  if(options.body) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Gatilho global para sessão expirada ou não autenticada
  if (response.status === 401) {
    redirect('/');
  }

  return response;
}