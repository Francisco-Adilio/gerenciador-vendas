'use client';

import { AppShell, Burger, Drawer, Group, NavLink, Stack, Text, Title, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarEvent, IconLogout, IconPackage, IconDiscount } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { logoutAction } from '../../actions';

const NAV = [
  { label: 'Eventos', href: '/eventos', icon: IconCalendarEvent },
  { label: 'Produtos', href: '/catalogo/produtos', icon: IconPackage, section: 'Catálogo' },
  { label: 'Promoções', href: '/catalogo/promocoes', icon: IconDiscount, section: 'Catálogo' },
];

export function AppFrame({ children }: { children: ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();

  return (
    <AppShell header={{ height: 52 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} size="sm" aria-label="Abrir menu" />
          <Title order={4} c="orange.8">
            <Link href="/eventos" style={{ color: 'inherit', textDecoration: 'none' }}>
              Gerenciador de Vendas
            </Link>
          </Title>
        </Group>
      </AppShell.Header>

      <Drawer opened={opened} onClose={close} size={280} title="Menu" padding="md">
        <Stack gap={4}>
          {NAV.map((item, i) => (
            <div key={item.href}>
              {item.section && NAV[i - 1]?.section !== item.section && (
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mt="md" mb={4}>{item.section}</Text>
              )}
              <NavLink
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<item.icon size={18} />}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                onClick={close}
              />
            </div>
          ))}
          <Divider my="md" />
          <form action={logoutAction}>
            <NavLink component="button" type="submit" label="Sair" leftSection={<IconLogout size={18} />} c="red" />
          </form>
        </Stack>
      </Drawer>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
