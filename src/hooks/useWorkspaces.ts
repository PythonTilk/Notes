import { useState, useEffect } from 'react';
import { Workspace, ApiResponse } from '@/types';
import { toast } from 'react-hot-toast';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/workspaces');
      
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      
      const data = await response.json();
      setWorkspaces(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to load workspaces');
      console.error('Error fetching workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (workspaceData: Partial<Workspace>): Promise<Workspace | null> => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const newWorkspace = await response.json();
      setWorkspaces(prev => [newWorkspace, ...prev]);
      toast.success('Workspace created successfully!');
      return newWorkspace;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      console.error('Error creating workspace:', err);
      return null;
    }
  };

  const deleteWorkspace = async (workspaceId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      setWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));
      toast.success('Workspace deleted successfully!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      console.error('Error deleting workspace:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return {
    workspaces,
    isLoading,
    error,
    fetchWorkspaces,
    createWorkspace,
    deleteWorkspace
  };
}