import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import ThemeToggle from "./components/ThemeToggle";
import AdminButton from "./components/AdminButton";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoteVault",
  description: "A modern note-taking app for organizing your thoughts",
  keywords: ["notes", "productivity", "organization", "collaboration"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <AuthProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                },
              }}
            />
            {children}
            <AdminButton />
            <ThemeToggle />
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}