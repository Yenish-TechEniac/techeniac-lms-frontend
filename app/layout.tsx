import './globals.css';

import type { Metadata } from 'next';

import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/context/QueryProvider';
import { SidebarProvider } from '@/context/SidebarContext';

export const metadata: Metadata = {
  title: 'Techeniac LMS',
  description: 'Techeniac Learning Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
