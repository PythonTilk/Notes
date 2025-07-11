"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/context/ToastContext";

interface BannedEmail {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminBannedEmailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [bannedEmails, setBannedEmails] = useState<BannedEmail[]>([]);
  const [newBannedEmail, setNewBannedEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "ADMIN")) {
      router.push("/login");
    }
  }, [status, router, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchBannedEmails();
    }
  }, [status, session]);

  const fetchBannedEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/banned-emails");
      if (response.ok) {
        const data = await response.json();
        setBannedEmails(data);
      } else {
        showToast("Failed to fetch banned emails.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while fetching banned emails.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBannedEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/banned-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newBannedEmail }),
      });

      if (response.ok) {
        setNewBannedEmail("");
        fetchBannedEmails();
        showToast("Email banned successfully!", "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to ban email.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while banning email.", "error");
    }
  };

  const handleDeleteBannedEmail = async (email: string) => {
    if (!confirm("Are you sure you want to unban this email?")) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/banned-emails/${email}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Email unbanned successfully!", "success");
        fetchBannedEmails();
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to unban email.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while unbanning email.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Manage Banned Emails</h1>

      <form onSubmit={handleAddBannedEmail} className="mb-8 rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Add Banned Email</h2>
        <div className="mb-4">
          <Input
            type="email"
            placeholder="Email to ban"
            value={newBannedEmail}
            onChange={(e) => setNewBannedEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Add Banned Email</Button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Banned At</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bannedEmails.map((bannedEmail) => (
              <tr key={bannedEmail.id}>
                <td className="py-2 px-4 border-b">{bannedEmail.id}</td>
                <td className="py-2 px-4 border-b">{bannedEmail.email}</td>
                <td className="py-2 px-4 border-b">{new Date(bannedEmail.createdAt).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteBannedEmail(bannedEmail.email)}
                  >
                    Unban
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
