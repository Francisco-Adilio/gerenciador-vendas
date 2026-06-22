'use client';

import { ScrollArea, NavLink, Stack, Box, Title, Divider, ActionIcon, Tooltip } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export interface MenuItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: MenuItem[];
}

interface SidebarProps {
  title?: string;
  menus: MenuItem[];
}

export function Sidebar({ title, menus }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const renderLinks = (items: MenuItem[]) => {
    return items.map((item, index) => {
      const isActive = item.href ? pathname === item.href : false;
      const isChildActive = item.children?.some(child => child.href && pathname.startsWith(child.href));

      // Se estiver colapsado, envolvemos o link em um Tooltip para acessibilidade visual
      const linkContent = (
        <NavLink
          key={item.label + index}
          label={collapsed ? '' : item.label} // Oculta o texto quando colapsado
          leftSection={item.icon}
          active={isActive || isChildActive}
          opened={collapsed ? false : isChildActive} // Evita abrir submenus se colapsado
          onClick={() => {
            if (item.href) {
              router.push(item.href);
            }
          }}
          styles={(theme) => ({
            root: {
              borderRadius: theme.radius.sm,
              marginBottom: 4,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px 0' : undefined,
              '&[dataActive]': {
                fontWeight: 600,
              },
            },
            section: {
              marginRight: collapsed ? 0 : undefined,
            },
          })}
        >
          {item.children && !collapsed ? renderLinks(item.children) : null}
        </NavLink>
      );

      return collapsed ? (
        <Tooltip key={item.label + index} label={item.label} position="right" withArrow transitionProps={{ duration: 150 }}>
          <Box>{linkContent}</Box>
        </Tooltip>
      ) : (
        linkContent
      );
    });
  };

  return (
    <Box
      component="nav"
      w={collapsed ? 70 : 260} // Controla a largura dinamicamente
      h="100vh"
      p="md"
      style={(theme) => ({
        position: 'sticky',
        top: 0,
        backgroundColor: theme.colors.gray[0],
        borderRight: `1px solid ${theme.colors.gray[3]}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease', // Suaviza a transição de abertura/fechamento
      })}
    >
      {/* Cabeçalho com Título e Botão de Alternância */}
      <Box 
        display="flex" 
        style={{ 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '40px'
        }}
        mb="xs"
      >
        {title && !collapsed && (
          <Title order={4} c="blue.7" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {title}
          </Title>
        )}
        
        <ActionIcon 
          variant="light" 
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
        >
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </ActionIcon>
      </Box>

      {!collapsed && <Divider mb="md" />}

      {/* Área dos Links */}
      <ScrollArea style={{ flex: 1 }} mx="-xs" px="xs">
        <Stack gap={0}>
          {renderLinks(menus)}
        </Stack>
      </ScrollArea>
    </Box>
  );
}