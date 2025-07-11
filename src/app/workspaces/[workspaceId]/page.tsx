"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/context/ToastContext";
import { NoteCard } from "@/components/NoteCard";

interface Workspace {
  id: number;
  name: string;
  description: string | null;
  color: string;
  notes: Note[];
}

interface Note {
  id: number;
  title: string;
  content: string | null;
}

export default function WorkspacePage({ params }: { params: { workspaceId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);

  const workspaceId = params.workspaceId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && workspaceId) {
      fetchWorkspace();
    }
  }, [status, workspaceId]);

  const fetchWorkspace = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspace(data);
        setName(data.name);
        setDescription(data.description || "");
        setColor(data.color);
      } else {
        showToast("Failed to fetch workspace.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while fetching the workspace.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, color }),
      });

      if (response.ok) {
        showToast("Workspace updated successfully!", "success");
        fetchWorkspace(); // Re-fetch to update notes if any changes
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to update workspace.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while updating the workspace.", "error");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Note deleted successfully!", "success");
        fetchWorkspace(); // Re-fetch workspace to update notes list
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to delete note.", "error");
      }
    } catch (err) {
      showToast("An unexpected error occurred while deleting the note.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!workspace) {
    return <p>Error: Workspace not found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Edit Workspace: {workspace.name}</h1>
      <form onSubmit={handleUpdateWorkspace} className="rounded-lg bg-white p-4 shadow-md mb-8">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="color" className="mb-2 block text-sm font-medium text-gray-700">
            Color
          </label>
          <Input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <Button type="submit">Update Workspace</Button>
      </form>

      <h2 className="mb-4 text-2xl font-bold">Notes in this Workspace</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspace.notes.length > 0 ? (
          workspace.notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
          ))
        ) : (
          <p>No notes in this workspace yet.</p>
        )}
      </div>
    </div>
  );
}
