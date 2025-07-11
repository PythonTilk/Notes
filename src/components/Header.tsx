import { Button } from "./ui/Button";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between p-4">
      <h1 className="text-2xl font-bold">Notes</h1>
      <div className="flex gap-2">
        <ThemeToggle />
        {status === "authenticated" ? (
          <Button onClick={() => signOut()}>Logout</Button>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
