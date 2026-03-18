import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import { AISupportChat } from '@/components/AISupportChat';
import { NotificationPermission } from '@/components/NotificationPermission';

export const metadata: Metadata = {
  title: 'Trapy — Ride Together',
  description: 'Find and share rides across India. Trapy connects riders and drivers for safe, affordable carpooling.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <AISupportChat />
          <NotificationPermission />
        </Providers>
      </body>
    </html>
  );
}
