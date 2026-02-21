import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AdminUsers from '../components/AdminUsers';
import AdminRemarketing from '../components/AdminRemarketing';
import AdminLogs from '../components/AdminLogs';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    User,
    Megaphone,
    LogOut,
    Plus,
    Activity,
    Server,
    Search,
    MoreVertical,
    CheckCircle,
    Mail,
    Terminal
} from 'lucide-react';

// Custom NavItem component similar to SalesDashboard
const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

// MetricCard component
const MetricCard = ({ title, value, trend, icon, trendUp, subtitle }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                {icon}
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {trend}
                </div>
            )}
        </div>
        <div>
            <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h4>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
                {subtitle && <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{subtitle}</span>}
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [currentView, setCurrentView] = useState('overview'); // overview, clients, users
    const [clients, setClients] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', email: '', company: '' });
    const { user } = useAuth();
    const navigate = useNavigate();

    // Stats state
    const [stats, setStats] = useState({
        totalClients: 0,
        activeClients: 0,
        totalUsers: 0,
        activeCampaigns: 0 // Placeholder
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch Clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (clientsError) throw clientsError;
            setClients(clientsData || []);

            // Fetch generic summary/stats (you might need specific queries depending on your DB)
            // For now, calculating from fetched data or placeholders
            const totalC = clientsData?.length || 0;
            const activeC = clientsData?.filter(c => c.status === 'Active').length || 0;

            setStats({
                totalClients: totalC,
                activeClients: activeC,
                totalUsers: 0, // In reality, fetch this count securely from backend or let AdminUsers component handle it
                activeCampaigns: 5 // Placeholder
            });

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([{ ...newClient, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            setClients([data, ...clients]);
            setStats(prev => ({ ...prev, totalClients: prev.totalClients + 1 }));
            setIsModalOpen(false);
            setNewClient({ name: '', email: '', company: '' });

            await supabase.from('client_history').insert({
                client_id: data.id,
                feature_name: 'System',
                action_type: 'create',
                details: { note: 'Client account created' }
            });

        } catch (error) {
            console.error('Error creating client:', error);
            alert('Failed to create client');
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Overview</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High-level metrics and system status.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Manual Clients"
                    value={stats.totalClients}
                    subtitle={`(${stats.activeClients} Active)`}
                    icon={<User size={24} />}
                />
                <MetricCard
                    title="System Users"
                    value="Manage in Users tab"
                    icon={<Users size={24} />}
                />
                <MetricCard
                    title="Active Campaigns"
                    value={stats.activeCampaigns}
                    icon={<Megaphone size={24} />}
                />
                <MetricCard
                    title="System Status"
                    value="Online"
                    trend="All Systems Operational"
                    trendUp={true}
                    icon={<Activity size={24} className="text-green-500" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Recent Clients Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recently Added Clients</h3>
                        <button onClick={() => setCurrentView('clients')} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {clients.slice(0, 5).map(client => (
                            <div key={client.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'Active'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {client.status}
                                </span>
                            </div>
                        ))}
                        {clients.length === 0 && <p className="text-center text-gray-500 py-4">No clients found.</p>}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => { setCurrentView('clients'); setIsModalOpen(true); }}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group text-left"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Add New Client</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manually onboard a new client to the system</p>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/campaigns/new')}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group text-left"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Megaphone size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Create Campaign</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Launch a new ad campaign for a client</p>
                            </div>
                        </button>
                        <button
                            onClick={() => setCurrentView('users')}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group text-left"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Manage Users</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Control system access and credit balances</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderClients = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clients Directory</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your manually tracked clients.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus size={18} /> Add Client
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {client.company || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'Active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(client.joined_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate(`/admin/client/${client.id}`)}
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 font-semibold"
                                    >
                                        History
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {clients.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No manual clients found. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300 pt-16 mt-8 md:mt-2 lg:-mt-2">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex-col hidden md:flex transition-colors duration-300">
                <nav className="flex-1 px-4 space-y-2 mt-6">
                    <NavItem
                        icon={<LogOut size={20} />}
                        label="Exit Admin"
                        active={false}
                        onClick={() => navigate('/home')}
                    />
                    <div className="h-4"></div> {/* Spacer */}
                    <div className="text-xs font-semibold text-slate-500 mb-4 px-4 uppercase tracking-wider">Administration</div>
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Overview"
                        active={currentView === 'overview'}
                        onClick={() => setCurrentView('overview')}
                    />
                    <NavItem
                        icon={<User size={20} />}
                        label="Clients Directory"
                        active={currentView === 'clients'}
                        onClick={() => setCurrentView('clients')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="System Users"
                        active={currentView === 'users'}
                        onClick={() => setCurrentView('users')}
                    />
                    <NavItem
                        icon={<Mail size={20} />}
                        label="Remarketing"
                        active={currentView === 'remarketing'}
                        onClick={() => setCurrentView('remarketing')}
                    />
                    <NavItem
                        icon={<Terminal size={20} />}
                        label="Logs"
                        active={currentView === 'logs'}
                        onClick={() => setCurrentView('logs')}
                    />
                    <NavItem
                        icon={<Megaphone size={20} />}
                        label="Campaigns"
                        active={false}
                        onClick={() => navigate('/admin/campaigns')}
                    />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white dark:bg-slate-900 transition-colors duration-300">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Control Panel</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full text-xs font-medium">
                            <Server size={14} />
                            Master Admin
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 relative">
                    <div className="max-w-6xl mx-auto pb-20">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                {currentView === 'overview' && renderOverview()}
                                {currentView === 'clients' && renderClients()}
                                {currentView === 'users' && <AdminUsers />}
                                {currentView === 'remarketing' && <AdminRemarketing />}
                                {currentView === 'logs' && <AdminLogs />}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100 dark:border-slate-700">
                            <form onSubmit={handleCreateClient} className="p-8">
                                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white mb-6">Add New Client</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newClient.name}
                                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newClient.email}
                                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                                        <input
                                            type="text"
                                            placeholder="Acme Corp"
                                            className="block w-full rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                                            value={newClient.company}
                                            onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3 sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                                    >
                                        Create Client
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                        onClick={() => setIsModalOpen(false)}
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

export default AdminDashboard;
