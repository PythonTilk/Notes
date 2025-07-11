"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NoteCard } from "@/components/NoteCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Note {
  id: number;
  title: string;
  content: string | null;
}

export default function NotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotes();
    }
  }, [status]);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      } else {
        setError("Failed to fetch notes.");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching notes.");
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newNoteTitle, content: newNoteContent }),
      });

      if (response.ok) {
        setNewNoteTitle("");
        setNewNoteContent("");
        fetchNotes();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to create note.");
      }
    } catch (err) {
      setError("An unexpected error occurred while creating note.");
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchNotes();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete note.");
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting note.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">My Notes</h1>

      <form onSubmit={handleCreateNote} className="mb-8 rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Create New Note</h2>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Note Title"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            placeholder="Note Content"
            rows={5}
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
          ></textarea>
        </div>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <Button type="submit">Create Note</Button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
        ))}
      </div>
    </div>
  );
}
