'use client';

import { ScrollArea, NavLink, Stack, Box, Title, Divider } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

// Define a estrutura de cada item de menu
export interface MenuItem {
  label: string;
  href?: string; // Opcional caso o item tenha submenus
  icon?: ReactNode;
  children?: MenuItem[]; // Suporte para submenus aninhados
}

interface SidebarProps {
  title?: string;
  menus: MenuItem[];
}

export function Sidebar({ title, menus }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Função recursiva para renderizar os menus e submenus
  const renderLinks = (items: MenuItem[]) => {
    return items.map((item, index) => {
      // Verifica se a rota atual corresponde ao link (ou se inicia com ele no caso de submenus)
      const isActive = item.href ? pathname === item.href : false;
      const isChildActive = item.children?.some(child => child.href && pathname.startsWith(child.href));

      return (
        <NavLink
          key={item.label + index}
          label={item.label}
          leftSection={item.icon}
          active={isActive || isChildActive}
          opened={isChildActive}
          onClick={() => {
            if (item.href) {
              router.push(item.href);
            }
          }}
          styles={(theme) => ({
            root: {
              borderRadius: theme.radius.sm,
              marginBottom: 4,
              '&[dataActive]': {
                fontWeight: 600,
              },
            },
          })}
        >
          {item.children ? renderLinks(item.children) : null}
        </NavLink>
      );
    });
  };

  return (
    <Box
      component="nav"
      w={260}
      h="100vh"
      p="md"
      style={(theme) => ({
        position: 'sticky',
        top: 0,
        backgroundColor: theme.colors.gray[0],
        borderRight: `1px solid ${theme.colors.gray[3]}`,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      {title && (
        <>
          <Box px="xs" py="sm">
            <Title order={4} c="blue.7">
              {title}
            </Title>
          </Box>
          <Divider mb="md" />
        </>
      )}

      <ScrollArea style={{ flex: 1 }} mx="-xs" px="xs">
        <Stack gap={0}>
          {renderLinks(menus)}
        </Stack>
      </ScrollArea>
    </Box>
  );
}