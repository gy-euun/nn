'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

// Chakra UI 테마 설정
const theme = extendTheme({
  colors: {
    brand: {
      100: '#f7fafc',
      200: '#edf2f7',
      300: '#e2e8f0',
      400: '#cbd5e0',
      500: '#a0aec0',
      600: '#718096',
      700: '#4a5568',
      800: '#2d3748',
      900: '#1a202c',
    },
  },
  fonts: {
    heading: 'var(--font-geist-sans)',
    body: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
} 