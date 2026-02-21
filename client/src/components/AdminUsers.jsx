import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth(); // for auth token if needed

    // Add User Modal State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', credits: 0 });
    const [isAddingUser, setIsAddingUser] = useState(false);

    // Add Credit Modal State
    const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creditAmount, setCreditAmount] = useState(0);
    const [isAddingCredits, setIsAddingCredits] = useState(false);

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

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsAddingUser(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await response.json();

            if (data.success) {
                toast.success('User created successfully');
                setIsAddUserModalOpen(false);
                setNewUser({ email: '', password: '', credits: 0 });
                fetchUsers();
            } else {
                toast.error(data.error || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            toast.error('Error adding user');
        } finally {
            setIsAddingUser(false);
        }
    };

    const handleAddCredits = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsAddingCredits(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}/credits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credits: creditAmount })
            });
            const data = await response.json();

            if (data.success) {
                toast.success('Credits added successfully');
                setIsAddCreditModalOpen(false);
                setCreditAmount(0);
                setSelectedUser(null);
                fetchUsers();
            } else {
                toast.error(data.error || 'Failed to add credits');
            }
        } catch (error) {
            console.error('Error adding credits:', error);
            toast.error('Error adding credits');
        } finally {
            setIsAddingCredits(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading system users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Users</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage registered users and credit balances.</p>
                </div>
                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700 w-full mb-8">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Account</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credits Available</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sign In</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold uppercase">
                                                {u.email.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{u.email}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">ID: {u.id.substring(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                                            {u.credits.toLocaleString()} Credits
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(u);
                                                setCreditAmount(0);
                                                setIsAddCreditModalOpen(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold"
                                        >
                                            Add Credits
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No registered users found.
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-slate-700">
                            <form onSubmit={handleAddUser} className="p-8">
                                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-6">Create New System User</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="admin@example.com"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Temporary Password</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="••••••••"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Credit Balance</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newUser.credits}
                                            onChange={(e) => setNewUser({ ...newUser, credits: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3 sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={isAddingUser}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                                    >
                                        {isAddingUser ? 'Creating...' : 'Create User'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                        onClick={() => setIsAddUserModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Credits Modal */}
            {isAddCreditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAddCreditModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-slate-700">
                            <form onSubmit={handleAddCredits} className="p-8">
                                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-2">
                                    Add Service Credits
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">For user: <span className="text-gray-900 dark:text-white">{selectedUser.email}</span></p>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Add</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors text-lg font-bold text-center"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3 sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={isAddingCredits}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                                    >
                                        {isAddingCredits ? 'Processing...' : 'Add Credits'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                        onClick={() => setIsAddCreditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

