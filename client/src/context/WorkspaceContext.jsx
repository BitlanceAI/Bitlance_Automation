import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config';

const WorkspaceContext = createContext();
export const useWorkspace = () => useContext(WorkspaceContext);

const STORAGE_KEY = 'activeWorkspaceId';

export const WorkspaceProvider = ({ children }) => {
    const { session } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    const authToken = session?.access_token;

    const fetchWorkspaces = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/workspaces`, {
                headers: { Authorization: `Bearer ${authToken}` },
            }).then(r => r.json());

            if (res.workspaces) {
                setWorkspaces(res.workspaces);
                const savedId = localStorage.getItem(STORAGE_KEY);
                const found = res.workspaces.find(w => w.id === savedId);
                if (found) {
                    setActiveWorkspace(found);
                } else if (res.workspaces.length > 0) {
                    setActiveWorkspace(res.workspaces[0]);
                    localStorage.setItem(STORAGE_KEY, res.workspaces[0].id);
                }
            }
        } catch (err) {
            console.error('[Workspace] fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (authToken) {
            fetchWorkspaces();
        } else {
            setWorkspaces([]);
            setActiveWorkspace(null);
            setLoading(false);
        }
    }, [authToken, fetchWorkspaces]);

    const switchWorkspace = (workspace) => {
        setActiveWorkspace(workspace);
        localStorage.setItem(STORAGE_KEY, workspace.id);
    };

    const createWorkspace = async (name) => {
        const res = await fetch(`${API_BASE_URL}/api/workspaces`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ name }),
        }).then(r => r.json());
        if (res.workspace) {
            setWorkspaces(prev => [...prev, res.workspace]);
            switchWorkspace(res.workspace);
        }
        return res;
    };

    const renameWorkspace = async (id, name) => {
        const res = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ name }),
        }).then(r => r.json());
        if (res.workspace) {
            setWorkspaces(prev => prev.map(w => w.id === id ? res.workspace : w));
            if (activeWorkspace?.id === id) setActiveWorkspace(res.workspace);
        }
        return res;
    };

    const deleteWorkspace = async (id) => {
        const res = await fetch(`${API_BASE_URL}/api/workspaces/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
        }).then(r => r.json());
        if (res.success) {
            const remaining = workspaces.filter(w => w.id !== id);
            setWorkspaces(remaining);
            if (activeWorkspace?.id === id) {
                const next = remaining[0] || null;
                setActiveWorkspace(next);
                if (next) localStorage.setItem(STORAGE_KEY, next.id);
                else localStorage.removeItem(STORAGE_KEY);
            }
        }
        return res;
    };

    // Stable object — only changes when the active workspace ID changes
    const workspaceHeaders = useMemo(
        () => activeWorkspace ? { 'x-workspace-id': activeWorkspace.id } : {},
        [activeWorkspace?.id]
    );

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            activeWorkspace,
            loading,
            switchWorkspace,
            createWorkspace,
            renameWorkspace,
            deleteWorkspace,
            workspaceHeaders,
            refetchWorkspaces: fetchWorkspaces,
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
