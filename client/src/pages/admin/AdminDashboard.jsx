import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminRemarketing from '../../components/admin/AdminRemarketing';
import AdminContactsLeads from '../../components/admin/AdminContactsLeads';
import EmailAutomationPage from '../dashboard/EmailAutomationPage';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    User,
    Megaphone,
    LogOut,
    Activity,
    Server,
    Mail,
    Terminal,
    FileText,
    TrendingUp
} from 'lucide-react';

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
    const [currentView, setCurrentView] = useState('overview'); // overview, users, leads
    const navigate = useNavigate();

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Overview</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">High-level metrics and system status.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <MetricCard
                    title="System Users"
                    value="Manage in Users tab"
                    icon={<Users size={24} />}
                />
                <MetricCard
                    title="System Status"
                    value="Online"
                    trend="All Systems Operational"
                    trendUp={true}
                    icon={<Activity size={24} className="text-green-500" />}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 mt-8">
                {/* Quick Actions Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <button
                            onClick={() => setCurrentView('users')}
                            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors group text-left"
                        >
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Users size={20} />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Manage Users</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Control system access and balance</p>
                            </div>
                        </button>
                    </div>
                </div>
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
                        icon={<TrendingUp size={20} />}
                        label="Leads"
                        active={currentView === 'leads'}
                        onClick={() => setCurrentView('leads')}
                    />
                    <NavItem
                        icon={<Mail size={20} />}
                        label="Email Automation"
                        active={currentView === 'email-automation'}
                        onClick={() => setCurrentView('email-automation')}
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
                        {currentView === 'overview' && renderOverview()}
                        {currentView === 'users' && <AdminUsers />}
                        {currentView === 'remarketing' && <AdminRemarketing />}
                        {currentView === 'leads' && <AdminContactsLeads />}
                        {currentView === 'email-automation' && <EmailAutomationPage />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
