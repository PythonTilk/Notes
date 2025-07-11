"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/context/ToastContext";

interface UserProfile {
  id: number;
  name: string | null;
  email: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setName(data.name || "");
        setEmail(data.email);
      } else {
        showToast("Failed to fetch profile.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while fetching the profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        showToast("Profile updated successfully!", "success");
        // Optionally, refresh session or redirect
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while updating the profile.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <p>Error: User profile not found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">My Profile</h1>
      <form onSubmit={handleUpdateProfile} className="rounded-lg bg-white p-4 shadow-md">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Update Profile</Button>
      </form>
    </div>
  );
}
