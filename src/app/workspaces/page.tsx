"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { WorkspaceCard } from "@/components/WorkspaceCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/context/ToastContext";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  color: string;
}

export default function WorkspacesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState("");
  const [newWorkspaceColor, setNewWorkspaceColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkspaces();
    }
  }, [status]);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      } else {
        showToast("Failed to fetch workspaces.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while fetching workspaces.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: newWorkspaceDescription,
          color: newWorkspaceColor,
        }),
      });

      if (response.ok) {
        setNewWorkspaceName("");
        setNewWorkspaceDescription("");
        setNewWorkspaceColor("#3B82F6");
        fetchWorkspaces();
        showToast("Workspace created successfully!", "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to create workspace.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while creating workspace.", "error");
    }
  };

  const handleDeleteWorkspace = async (id: number) => {
    try {
      const response = await fetch(`/api/workspaces/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchWorkspaces();
        showToast("Workspace deleted successfully!", "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to delete workspace.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while deleting workspace.", "error");
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
      <h1 className="mb-4 text-3xl font-bold">My Workspaces</h1>

      <form
        onSubmit={handleCreateWorkspace}
        className="mb-8 rounded-lg bg-white p-4 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-semibold">Create New Workspace</h2>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Workspace Name"
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            placeholder="Workspace Description (optional)"
            rows={3}
            value={newWorkspaceDescription}
            onChange={(e) => setNewWorkspaceDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="color" className="mb-2 block text-sm font-medium text-gray-700">
            Color
          </label>
          <Input
            type="color"
            id="color"
            value={newWorkspaceColor}
            onChange={(e) => setNewWorkspaceColor(e.target.value)}
          />
        </div>
        <Button type="submit">Create Workspace</Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <WorkspaceCard
            key={workspace.id}
            workspace={workspace}
            onDelete={handleDeleteWorkspace}
          />
        ))}
      </div>
    </div>
  );
}
