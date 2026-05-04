import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Pencil, Trash2, Check, Building2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const WorkspaceSwitcher = () => {
    const { workspaces, activeWorkspace, switchWorkspace, createWorkspace, renameWorkspace, deleteWorkspace } = useWorkspace();
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [busy, setBusy] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleCreate = async () => {
        if (!newName.trim() || busy) return;
        setBusy(true);
        await createWorkspace(newName.trim());
        setNewName('');
        setCreating(false);
        setBusy(false);
    };

    const handleRename = async (id) => {
        if (!editName.trim() || busy) return;
        setBusy(true);
        await renameWorkspace(id, editName.trim());
        setEditingId(null);
        setBusy(false);
    };

    const handleDelete = async (id) => {
        if (workspaces.length <= 1) return; // keep at least one
        if (!confirm('Delete this workspace? All linked connections will be unlinked.')) return;
        setBusy(true);
        await deleteWorkspace(id);
        setBusy(false);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-200 text-sm font-medium transition-colors"
            >
                <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="max-w-[120px] truncate">{activeWorkspace?.name || 'No Workspace'}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-3 pt-3 pb-1">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Workspaces</p>
                    </div>

                    <div className="max-h-52 overflow-y-auto">
                        {workspaces.map(ws => (
                            <div key={ws.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-slate-800 cursor-pointer">
                                {editingId === ws.id ? (
                                    <input
                                        autoFocus
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleRename(ws.id); if (e.key === 'Escape') setEditingId(null); }}
                                        className="flex-1 bg-slate-700 text-slate-200 text-sm rounded px-2 py-0.5 focus:outline-none border border-indigo-500"
                                        onClick={e => e.stopPropagation()}
                                    />
                                ) : (
                                    <button
                                        className="flex-1 flex items-center gap-2 text-left text-sm text-slate-200"
                                        onClick={() => { switchWorkspace(ws); setOpen(false); }}
                                    >
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${activeWorkspace?.id === ws.id ? 'bg-indigo-500' : 'bg-slate-600'}`} />
                                        <span className="truncate">{ws.name}</span>
                                        {activeWorkspace?.id === ws.id && <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />}
                                    </button>
                                )}

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {editingId === ws.id ? (
                                        <button onClick={() => handleRename(ws.id)} className="p-0.5 text-indigo-400 hover:text-indigo-300">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button onClick={() => { setEditingId(ws.id); setEditName(ws.name); }} className="p-0.5 text-slate-400 hover:text-slate-200">
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {workspaces.length > 1 && (
                                        <button onClick={() => handleDelete(ws.id)} className="p-0.5 text-slate-400 hover:text-red-400">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-700 p-2">
                        {creating ? (
                            <div className="flex gap-1">
                                <input
                                    autoFocus
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
                                    placeholder="Workspace name"
                                    className="flex-1 bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                />
                                <button onClick={handleCreate} disabled={busy || !newName.trim()} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg font-medium">
                                    Add
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setCreating(true)} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                                New Workspace
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSwitcher;
