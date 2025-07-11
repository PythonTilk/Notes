import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    return <p>Access Denied</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      <div className="flex gap-4">
        <Link href="/admin/users">
          <Button>Manage Users</Button>
        </Link>
        {/* Add more admin links here */}
      </div>
    </div>
  );
}
