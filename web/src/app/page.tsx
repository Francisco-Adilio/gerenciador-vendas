'use client';

import { 
  Box, 
  Button, 
  Center, 
  PasswordInput, 
  TextInput, 
  Title, 
  Paper, 
  Stack 
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Substitua pela sua lógica de autenticação real aqui
    if (login && password) {
      router.push('/sales');
    }
  };

  return (
    <Center style={{ width: '100vw', height: '100vh', backgroundColor: '#f8f9fa' }}>
      <Paper withBorder shadow="md" p="xl" radius="md" style={{ width: '100%', maxWidth: 400 }}>
        <Stack gap="xs" mb="lg">
          <Title order={2} ta="center" c="blue.7">
            Acessar o Sistema
          </Title>
        </Stack>

        <form onSubmit={handleLogin}>
          <Stack>
            <TextInput
              label="Login"
              placeholder="Login"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />

            <PasswordInput
              label="Senha"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button type="submit" fullWidth mt="md" color="blue">
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
