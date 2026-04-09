/* eslint-disable react-refresh/only-export-components */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../index.css';
import Providers from '../components/providers/Providers';

export const metadata: Metadata = {
  title: 'Leddar Artisan App',
  description: 'Artisan workflow dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
