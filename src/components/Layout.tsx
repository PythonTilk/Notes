"use client";

import { useSession } from "next-auth/react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null; // Or a loading spinner
  }

  const isAuthenticated = status === "authenticated";

  return (
    <div className="flex min-h-screen flex-col">
      {isAuthenticated && <Header />}
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-4">{children}</main>
      </div>
      {isAuthenticated && <Footer />}
    </div>
  );
}
