import Link from "next/link";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface WorkspaceCardProps {
  workspace: {
    id: number;
    name: string;
    description: string | null;
    color: string;
  };
  onDelete: (id: number) => void;
}

export function WorkspaceCard({ workspace, onDelete }: WorkspaceCardProps) {
  return (
    <Card style={{ borderLeft: `4px solid ${workspace.color}` }}>
      <h3 className="mb-2 text-xl font-semibold">{workspace.name}</h3>
      <p className="mb-4 text-gray-600">{workspace.description || "No description"}</p>
      <div className="flex gap-2">
        <Link href={`/workspaces/${workspace.id}`}>
          <Button size="sm">View</Button>
        </Link>
        <Button size="sm" variant="secondary" onClick={() => onDelete(workspace.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
