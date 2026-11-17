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
      router.push(state.redirectTo ?? '/eventos');
      router.refresh();
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <Center style={{ minHeight: '100dvh', backgroundColor: 'var(--mantine-color-gray-0)' }} p="md">
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
