import Link from "next/link";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface NoteCardProps {
  note: {
    id: number;
    title: string;
    content: string | null;
  };
  onDelete: (id: number) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  return (
    <Card>
      <h3 className="mb-2 text-xl font-semibold">{note.title}</h3>
      <p className="mb-4 text-gray-600">{note.content?.substring(0, 100)}...</p>
      <div className="flex gap-2">
        <Link href={`/notes/${note.id}`}>
          <Button size="sm">View</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={() => onDelete(note.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
