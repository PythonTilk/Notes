import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/session-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono' 
});

export const metadata: Metadata = {
  title: 'NoteVault - Modern Note Trading Platform',
  description: 'A modern note-taking application with trading-style dashboard inspired by rugplay.com',
  keywords: ['notes', 'trading', 'dashboard', 'productivity', 'modern'],
  authors: [{ name: 'NoteVault Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00ff88',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'NoteVault - Modern Note Trading Platform',
    description: 'A modern note-taking application with trading-style dashboard',
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