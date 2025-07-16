import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/session-provider';
import { InstallPrompt, PWAStatus } from '@/components/pwa/InstallPrompt';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:12000'),
  title: 'NoteVault - Collaborative Workspace Platform',
  description: 'A collaborative workspace platform for notes, files, and team communication with AI insights',
  keywords: ['notes', 'collaboration', 'workspace', 'productivity', 'AI', 'real-time'],
  authors: [{ name: 'NoteVault Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NoteVault - Collaborative Workspace Platform',
    description: 'A collaborative workspace platform with AI insights and real-time collaboration',
    type: 'website',
    locale: 'en_US',
    siteName: 'NoteVault',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoteVault - Modern Note Trading Platform',
    description: 'A modern note-taking application with trading-style dashboard',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00ff88',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              {children}
              <InstallPrompt />
              <PWAStatus />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                success: {
                  iconTheme: {
                    primary: '#00ff88',
                    secondary: 'hsl(var(--card))',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff0066',
                    secondary: 'hsl(var(--card))',
                  },
                },
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}