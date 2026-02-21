import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Send, CheckCircle, Users } from 'lucide-react';

const AdminRemarketing = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserEmails, setSelectedUserEmails] = useState(new Set());
    const [isSending, setIsSending] = useState(false);

    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const { user: currentUser } = useAuth(); // for auth token if needed

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users:', data.error);
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserSelect = (email) => {
        const newSelected = new Set(selectedUserEmails);
        if (newSelected.has(email)) {
            newSelected.delete(email);
        } else {
            newSelected.add(email);
        }
        setSelectedUserEmails(newSelected);
    };

    const selectAll = () => {
        if (selectedUserEmails.size === users.length && users.length > 0) {
            setSelectedUserEmails(new Set()); // Deselect all
        } else {
            setSelectedUserEmails(new Set(users.map(u => u.email))); // Select all
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();

        if (selectedUserEmails.size === 0) {
            toast.error('Please select at least one user to email.');
            return;
        }

        if (!subject.trim() || !body.trim()) {
            toast.error('Subject and Body are required.');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/remarketing/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmails: Array.from(selectedUserEmails),
                    subject,
                    body
                })
            });
            const data = await response.json();

            if (data.success) {
                toast.success(data.message || 'Remarketing emails sent successfully!');
                setSubject('');
                setBody('');
                setSelectedUserEmails(new Set());
            } else {
                toast.error(data.error || 'Failed to send remarketing emails');
            }
        } catch (error) {
            console.error('Error sending remarketing emails:', error);
            toast.error('An error occurred while sending emails.');
        } finally {
            setIsSending(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading user database...</div>;

    const allSelected = users.length > 0 && selectedUserEmails.size === users.length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-6 h-6 text-indigo-500" />
                        Email Remarketing
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Send targeted OneSignal remarketing emails to selected platform users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: User Selection */}
                <div className="lg:col-span-1 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            Select Recipients
                        </h4>
                        <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                            {selectedUserEmails.size} selected
                        </span>
                    </div>

                    <div className="p-3 border-b border-gray-100 dark:border-slate-700 shrink-0">
                        <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/30 rounded-lg cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={selectAll}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-indigo-500"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Select All ({users.length})</span>
                        </label>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {users.map((u) => (
                            <label key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors group">
                                <input
                                    type="checkbox"
                                    checked={selectedUserEmails.has(u.email)}
                                    onChange={() => toggleUserSelect(u.email)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 bg-white dark:bg-slate-700 dark:border-slate-600 dark:checked:bg-indigo-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {u.email}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        Joined: {new Date(u.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </label>
                        ))}
                        {users.length === 0 && (
                            <div className="text-center py-10 text-gray-500 text-sm">No users found.</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Email Composer */}
                <div className="lg:col-span-2 border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl shadow-sm h-[600px] flex flex-col">
                    <form onSubmit={handleSendEmail} className="flex flex-col h-full">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700 shrink-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Compose Email</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Special Offer: 50% extra credits!"
                                        className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors outline-none"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex flex-col min-h-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body (HTML Supported)</label>
                            <textarea
                                required
                                placeholder="<p>Hello there! We have an exciting new feature...</p>"
                                className="block w-full h-full resize-none rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border transition-colors outline-none font-mono text-sm leading-relaxed"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 shrink-0 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSending || selectedUserEmails.size === 0}
                                className="inline-flex items-center gap-2 justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSending ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send to {selectedUserEmails.size} {selectedUserEmails.size === 1 ? 'User' : 'Users'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AdminRemarketing;
