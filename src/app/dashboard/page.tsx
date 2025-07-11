import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Access Denied</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Dashboard</h1>
      <p className="mb-6 text-lg">Welcome, {session.user?.name || session.user?.email}!</p>
      <Link href="/notes">
        <Button>Go to Notes</Button>
      </Link>
    </div>
  );
}

