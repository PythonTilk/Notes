import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";
import ThemeToggle from "./components/ThemeToggle";
import AdminButton from "./components/AdminButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoteVault",
  description: "A modern note-taking app",
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
          {children}
          <AdminButton />
        </Provider>
        <ThemeToggle />
      </body>
    </html>
  );
}