'use client';

import { 
  Button, 
  Center, 
  PasswordInput, 
  TextInput, 
  Title, 
  Paper, 
  Stack,
  Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { loginAction, LoginState } from './actions';

export default function LoginPage() {
  const router = useRouter();
  
  const initialState: LoginState = { success: false, error: null };
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push('/sales');
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <Center style={{ width: '100vw', height: '100vh', backgroundColor: '#f8f9fa' }}>
      <Paper withBorder shadow="md" p="xl" radius="md" style={{ width: '100%', maxWidth: 400 }}>
        <Stack gap="xs" mb="lg">
          <Title order={2} ta="center" c="blue.7">
            Acessar o Sistema
          </Title>
        </Stack>

        {state.error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red" mb="md">
            {state.error}
          </Alert>
        )}

        <form action={formAction}>
          <Stack>
            <TextInput
              label="Login"
              placeholder="Login"
              name="name"
              required
              disabled={isPending}
            />

            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              name="password"
              required
              disabled={isPending}
            />

            <Button 
              type="submit" 
              fullWidth 
              mt="md" 
              color="blue"
              loading={isPending}
            >
              Entrar
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
