
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Note from "./components/Note";
import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

// This is a client component, so we can't use getServerSession directly here.
// We'll fetch notes on the client side.

function SortableNote({ note }: { note: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Note note={note} />
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const fetchNotes = async () => {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('query', searchQuery);
        }
        if (searchTags) {
          params.append('tags', searchTags);
        }
        const res = await fetch(`/api/notes?${params.toString()}`);
        const data = await res.json();
        setNotes(data);
      };
      fetchNotes();
    }
  }, [status, router, searchQuery, searchTags]);

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (status === 'loading') {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header flex-col md:flex-row">
        <div className="logo">
          <h1>NoteVault</h1>
        </div>
        <div className="search-bar w-full md:w-auto">
          <form onSubmit={(e) => { e.preventDefault(); /* Fetch notes is handled by useEffect */ }} className="flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md md:rounded-l-none md:rounded-tl-md md:rounded-bl-md"
            />
            <input
              type="text"
              placeholder="Search by tags (comma-separated)"
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-r-md md:rounded-r-none md:rounded-tr-md md:rounded-br-md"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
        </div>
        <div className="user-menu">
          <span>Hello, {session?.user?.name || session?.user?.email}!</span>
          <Link href="/profile" className="user-avatar">
            {session?.user?.name ? session.user.name.charAt(0) : session?.user?.email?.charAt(0)}
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="board-container">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={notes.map(note => note.id)} strategy={verticalListSortingStrategy}>
            <div className="note-board">
              {notes.map((note) => (
                <SortableNote key={note.id} note={note} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Link href="/notes/new" className="floating-btn">
          +
        </Link>
      </main>
    </div>
  );
}
