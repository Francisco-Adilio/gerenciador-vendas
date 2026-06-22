'use client';

import { Flex, Box } from '@mantine/core';
import { IconDashboard, IconUsers } from '@tabler/icons-react';
import { Sidebar, MenuItem } from './components/Sidebar';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // 1. Definição dos menus da sua barra lateral
  const navMenus: MenuItem[] = [
    {
      label: 'Vendas',
      href: '/sales',
      icon: <IconDashboard size={18} />,
    },
    {
      label: 'Produtos',
      href: '/products',
      icon: <IconUsers size={18} />,
    },
    {
      label: 'Promoções',
      href: '/promotions',
      icon: <IconUsers size={18} />,
    },
  ];

  return (
    <Flex>
      {/* 2. Renderiza a Sidebar fixa na lateral esquerda */}
      <Sidebar title="Painel Admin" menus={navMenus} />

      {/* 3. Área de conteúdo principal à direita com rolagem independente */}
      <Box
        component="main"
        style={{
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
        }}
        p="xl"
      >
        {children}
      </Box>
    </Flex>
  );
}