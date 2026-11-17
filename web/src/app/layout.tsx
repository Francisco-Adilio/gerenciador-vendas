import './globals.css'
import '@mantine/core/styles.css';

import { ColorSchemeScript, createTheme, MantineProvider, mantineHtmlProps } from '@mantine/core';
import type { Viewport } from 'next';

const theme = createTheme({
  primaryColor: 'orange',
  defaultRadius: 'md',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fd7e14',
};

export const metadata = {
  title: 'Gerenciador Vendas',
  description: 'Gerenciador de vendas para Festa Junina do IFSC 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">{children}</MantineProvider>
      </body>
    </html>
  );
}