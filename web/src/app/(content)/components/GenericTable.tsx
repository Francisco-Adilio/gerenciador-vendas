'use client';

import { Table, Menu, ActionIcon, Group, Text } from '@mantine/core';
import { IconDotsVertical, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { ReactNode } from 'react';

// Define a estrutura de cada coluna
export interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T) => ReactNode;
}

// Define a estrutura de uma ação do menu
export interface TableAction<T> {
  label: string;
  icon?: ReactNode;
  color?: string;
  onClick: (item: T) => void;
}

// Props do componente genérico
interface GenericTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  rowKey: keyof T;
}

export function GenericTable<T>({ data, columns, actions, rowKey }: GenericTableProps<T>) {
  // Renderiza o cabeçalho da tabela
  const ths = columns.map((col) => (
    <Table.Th key={String(col.key)}>{col.header}</Table.Th>
  ));

  // Renderiza as linhas da tabela
  const rows = data.map((item) => (
    <Table.Tr key={String(item[rowKey])}>
      {columns.map((col) => {
        // Caso seja a coluna de ações
        if (col.key === 'actions' && actions) {
          return (
            <Table.Td key="actions" style={{ width: '50px' }}>
              <Menu shadow="md" width={200} position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {actions.map((action, index) => (
                    <Menu.Item
                      key={index}
                      leftSection={action.icon}
                      color={action.color}
                      onClick={() => action.onClick(item)}
                    >
                      {action.label}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          );
        }

        // Caso tenha uma função customizada de render para a célula
        if (col.render) {
          return <Table.Td key={String(col.key)}>{col.render(item)}</Table.Td>;
        }

        // Renderização padrão de texto simples
        return <Table.Td key={String(col.key)}>{String(item[col.key as keyof T])}</Table.Td>;
      })}
    </Table.Tr>
  ));

  return (
    <Table highlightOnHover withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>{ths}</Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.length > 0 ? (
          rows
        ) : (
          <Table.Tr>
            <Table.Td colSpan={columns.length} align="center">
              <Text c="dimmed" py="xl">Nenhum registro encontrado.</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
