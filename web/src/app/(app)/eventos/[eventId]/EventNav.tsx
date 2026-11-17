'use client';

import { Anchor, Box, Group, Paper, Tabs, Text, UnstyledButton } from '@mantine/core';
import { IconCash, IconChartBar, IconPackage, IconReceipt, IconSwitchHorizontal } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { LAST_EVENT_COOKIE } from '../../../lib/constants';

export const BOTTOM_NAV_HEIGHT = 60;

interface Props {
  eventId: string;
  eventName: string;
  children: ReactNode;
}

export function EventNav({ eventId, eventName, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const base = `/eventos/${eventId}`;

  const tabs = [
    { value: base, label: 'Caixa', icon: IconCash },
    { value: `${base}/vendas`, label: 'Vendas', icon: IconReceipt },
    { value: `${base}/resumo`, label: 'Resumo', icon: IconChartBar },
    { value: `${base}/produtos`, label: 'Produtos', icon: IconPackage },
  ];
  const active = tabs.find((t) => t.value === pathname)?.value ?? base;

  // Remember this event so the next login opens its checkout directly
  useEffect(() => {
    document.cookie = `${LAST_EVENT_COOKIE}=${eventId}; path=/; max-age=${60 * 60 * 24 * 60}; samesite=lax`;
  }, [eventId]);

  return (
    <Box pb={{ base: BOTTOM_NAV_HEIGHT, sm: 0 }}>
      {/* Event header */}
      <Group justify="space-between" px="md" py="xs" bg="orange.0" wrap="nowrap" style={{ borderBottom: '1px solid var(--mantine-color-orange-2)' }}>
        <Text fw={700} truncate>{eventName}</Text>
        <Anchor component={Link} href="/eventos" size="sm" style={{ whiteSpace: 'nowrap' }}>
          <Group gap={4} wrap="nowrap"><IconSwitchHorizontal size={14} /> Trocar evento</Group>
        </Anchor>
      </Group>

      {/* Top tabs on tablet/desktop */}
      <Tabs value={active} onChange={(v) => v && router.push(v)} visibleFrom="sm" px="md">
        <Tabs.List>
          {tabs.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={16} />}>{t.label}</Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {children}

      {/* Bottom tab bar on phones */}
      <Paper
        hiddenFrom="sm"
        shadow="md"
        radius={0}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: BOTTOM_NAV_HEIGHT, zIndex: 150,
          borderTop: '1px solid var(--mantine-color-gray-3)', display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {tabs.map((t) => {
          const isActive = t.value === active;
          return (
            <UnstyledButton
              key={t.value}
              component={Link}
              href={t.value}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                color: isActive ? 'var(--mantine-color-orange-7)' : 'var(--mantine-color-gray-6)',
              }}
            >
              <t.icon size={22} stroke={isActive ? 2.2 : 1.6} />
              <Text size="xs" fw={isActive ? 700 : 500} c="inherit">{t.label}</Text>
            </UnstyledButton>
          );
        })}
      </Paper>
    </Box>
  );
}
