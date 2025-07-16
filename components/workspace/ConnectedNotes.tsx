'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Link2, Trash2, Edit3, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  color: string;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color: string;
  style: 'SOLID' | 'DASHED' | 'DOTTED';
}

interface ConnectedNotesProps {
  notes: Note[];
  connections: Connection[];
  onCreateConnection: (fromId: string, toId: string, label?: string, color?: string, style?: string) => void;
  onUpdateConnection: (id: string, updates: Partial<Connection>) => void;
  onDeleteConnection: (id: string) => void;
  selectedNoteId?: string;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const ConnectedNotes: React.FC<ConnectedNotesProps> = ({
  notes,
  connections,
  onCreateConnection,
  onUpdateConnection,
  onDeleteConnection,
  selectedNoteId,
  canvasRef,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle mouse move for temporary connection line
  useEffect(() => {
    if (!isConnecting || !connectionStart || !canvasRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      setTempConnection({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleClick = (e: MouseEvent) => {
      // Check if clicked on a note
      const target = e.target as HTMLElement;
      const noteElement = target.closest('[data-note-id]');
      
      if (noteElement) {
        const toId = noteElement.getAttribute('data-note-id');
        if (toId && toId !== connectionStart) {
          onCreateConnection(connectionStart, toId);
          toast.success('Connection created!');
        }
      }
      
      // Reset connection state
      setIsConnecting(false);
      setConnectionStart(null);
      setTempConnection(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [isConnecting, connectionStart, canvasRef, onCreateConnection]);

  const startConnection = (noteId: string) => {
    setIsConnecting(true);
    setConnectionStart(noteId);
    toast('Click on another note to create a connection', { icon: '🔗' });
  };

  const cancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  const getNoteBounds = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return null;

    return {
      x: note.positionX,
      y: note.positionY,
      width: note.width,
      height: note.height,
      centerX: note.positionX + note.width / 2,
      centerY: note.positionY + note.height / 2,
    };
  };

  const getConnectionPath = (connection: Connection) => {
    const fromBounds = getNoteBounds(connection.fromId);
    const toBounds = getNoteBounds(connection.toId);

    if (!fromBounds || !toBounds) return '';

    // Calculate connection points (center to center for now)
    const fromX = fromBounds.centerX;
    const fromY = fromBounds.centerY;
    const toX = toBounds.centerX;
    const toY = toBounds.centerY;

    // Create a curved path
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    const controlOffset = 50;

    return `M ${fromX} ${fromY} Q ${midX} ${midY - controlOffset} ${toX} ${toY}`;
  };

  const getStrokeDashArray = (style: string) => {
    switch (style) {
      case 'DASHED':
        return '10,5';
      case 'DOTTED':
        return '3,3';
      default:
        return 'none';
    }
  };

  const ConnectionEditDialog = ({ connection }: { connection: Connection }) => {
    const [label, setLabel] = useState(connection.label || '');
    const [color, setColor] = useState(connection.color);
    const [style, setStyle] = useState(connection.style);

    const handleSave = () => {
      onUpdateConnection(connection.id, { label, color, style });
      setEditingConnection(null);
      toast.success('Connection updated!');
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Connection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Optional connection label"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 mt-1">
              {['#6b7280', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === c ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Style</label>
            <Select value={style} onValueChange={(value: any) => setStyle(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLID">Solid</SelectItem>
                <SelectItem value="DASHED">Dashed</SelectItem>
                <SelectItem value="DOTTED">Dotted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setEditingConnection(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <>
      {/* Connection Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 border">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isConnecting ? "destructive" : "outline"}
            onClick={isConnecting ? cancelConnection : () => selectedNoteId && startConnection(selectedNoteId)}
            disabled={!selectedNoteId}
          >
            {isConnecting ? (
              <>Cancel Connection</>
            ) : (
              <>
                <Link2 className="w-4 h-4 mr-1" />
                Connect
              </>
            )}
          </Button>
          
          {connections.length > 0 && (
            <Badge variant="secondary">
              {connections.length} connection{connections.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {isConnecting && (
          <div className="mt-2 text-xs text-gray-600">
            Click on another note to create connection
          </div>
        )}
      </div>

      {/* SVG Overlay for Connections */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none z-5"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#6b7280"
            />
          </marker>
        </defs>

        {/* Render existing connections */}
        {connections.map((connection) => {
          const path = getConnectionPath(connection);
          if (!path) return null;

          return (
            <g key={connection.id}>
              <path
                d={path}
                stroke={connection.color}
                strokeWidth="2"
                fill="none"
                strokeDasharray={getStrokeDashArray(connection.style)}
                markerEnd="url(#arrowhead)"
                className="pointer-events-auto cursor-pointer hover:stroke-width-3"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingConnection(connection);
                }}
              />
              
              {/* Connection label */}
              {connection.label && (
                <text
                  x={(getNoteBounds(connection.fromId)?.centerX || 0 + getNoteBounds(connection.toId)?.centerX || 0) / 2}
                  y={(getNoteBounds(connection.fromId)?.centerY || 0 + getNoteBounds(connection.toId)?.centerY || 0) / 2 - 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingConnection(connection);
                  }}
                >
                  {connection.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Temporary connection line */}
        {isConnecting && connectionStart && tempConnection && (
          <line
            x1={getNoteBounds(connectionStart)?.centerX || 0}
            y1={getNoteBounds(connectionStart)?.centerY || 0}
            x2={tempConnection.x}
            y2={tempConnection.y}
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        )}
      </svg>

      {/* Connection Edit Dialog */}
      <Dialog open={!!editingConnection} onOpenChange={() => setEditingConnection(null)}>
        {editingConnection && <ConnectionEditDialog connection={editingConnection} />}
      </Dialog>

      {/* Connection Context Menu */}
      {editingConnection && (
        <div className="absolute top-20 right-4 z-20 bg-white rounded-lg shadow-lg border p-2">
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Edit functionality is handled by the dialog
              }}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                onDeleteConnection(editingConnection.id);
                setEditingConnection(null);
                toast.success('Connection deleted');
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </>
  );
};