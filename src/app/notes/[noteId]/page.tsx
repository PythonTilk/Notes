"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Note {
  id: number;
  title: string;
  content: string | null;
}

export default function NotePage({ params }: { params: { noteId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const noteId = params.noteId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && noteId) {
      fetchNote();
    }
  }, [status, noteId]);

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
        setTitle(data.title);
        setContent(data.content || "");
      } else {
        setError("Failed to fetch note.");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching the note.");
    }
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        router.push("/notes"); // Redirect back to notes list
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update note.");
      }
    } catch (err) {
      setError("An unexpected error occurred while updating the note.");
    }
  };

  if (status === "loading" || !note) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-3xl font-bold">Edit Note</h1>
      <form onSubmit={handleUpdateNote} className="rounded-lg bg-white p-4 shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
            Title
          </label>
          <Input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-blue-500 focus:outline-none"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <Button type="submit">Update Note</Button>
      </form>
    </div>
  );
}
