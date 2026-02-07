import React, { useState, useEffect } from 'react';
import { Plus, BarChart2, List, Trash2, Eye, Link2, Unlink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MetaConnectModal from '../components/meta/MetaConnectModal';
// import { toast } from 'react-hot-toast'; // Assuming usage

const CampaignManagerPage = () => {
    const { user, session } = useAuth();
    const [activeTab, setActiveTab] = useState('list'); // list, create
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Meta Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'awareness', // awareness, traffic, engagement, leadgen
        objective: 'brand_awareness',
        status: 'draft',
        creative_assets: {
            headline: '',
            description: '',
            imageUrl: '',
            ctaText: '',
            ctaUrl: '',
        },
        destination_url: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        targeting: {},
    });

    useEffect(() => {
        if (user) {
            fetchCampaigns();
            checkMetaConnection();
        }
    }, [user]);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || user?.token}`
    });

    const checkMetaConnection = async () => {
        try {
            const res = await fetch('/api/meta/connection', {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.connected && data.isValid) {
                setIsConnected(true);
            } else {
                setIsConnected(false);
            }
        } catch (error) {
            console.error('Meta connection check failed:', error);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns', {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            // toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                // toast.success('Campaign created successfully');
                setActiveTab('list');
                fetchCampaigns();
                // Reset form slightly
                setFormData({ ...formData, name: '', creative_assets: { ...formData.creative_assets, headline: '' } });
            } else {
                // toast.error('Failed to create campaign');
                alert('Error: ' + (data.error || 'Failed to create'));
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
        }
    };

    const handleInputChange = (e, section = null) => {
        if (section === 'creative_assets') {
            setFormData({
                ...formData,
                creative_assets: {
                    ...formData.creative_assets,
                    [e.target.name]: e.target.value
                }
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <MetaConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={() => { setIsConnected(true); checkMetaConnection(); }}
                userToken={session?.access_token || user?.token}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign Manager</h1>
                    <p className="text-gray-500 mt-1">Manage your internal marketing campaigns</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowConnectModal(true)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-colors ${isConnected
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                    >
                        {isConnected ? <Link2 size={18} /> : <Unlink size={18} />}
                        {isConnected ? 'Facebook Connected' : 'Connect Facebook'}
                    </button>

                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        <List size={18} /> List
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                    >
                        <Plus size={18} /> Create New
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                    ) : campaigns.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <p>No campaigns found.</p>
                            <button onClick={() => setActiveTab('create')} className="mt-4 text-blue-600 underline">Create your first campaign</button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                    <th className="p-4 font-semibold border-b dark:border-gray-600">Name</th>
                                    <th className="p-4 font-semibold border-b dark:border-gray-600">Type</th>
                                    <th className="p-4 font-semibold border-b dark:border-gray-600">Status</th>
                                    <th className="p-4 font-semibold border-b dark:border-gray-600">Created</th>
                                    <th className="p-4 font-semibold border-b dark:border-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {campaigns.map(campaign => (
                                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 uppercase`}>
                                                {campaign.objective || 'Awareness'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {campaign.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(campaign.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <BarChart2 size={16} />
                                                </button>
                                                <button className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <Eye size={16} />
                                                </button>
                                                {/* <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Campaign</h2>
                    <form onSubmit={handleCreateSubmit} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Summer Sale Awareness"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            type: e.target.value,
                                            objective: e.target.value === 'leadgen' ? 'generate_leads' : e.target.value === 'traffic' ? 'traffic' : 'brand_awareness'
                                        });
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="awareness">Awareness (Banners)</option>
                                    <option value="traffic">Traffic (Link Cards)</option>
                                    <option value="engagement">Engagement (Like/Share)</option>
                                    <option value="leadgen">Lead Generation (Forms)</option>
                                </select>
                            </div>
                        </div>

                        {/* Creative Assets */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Creative Assets</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Headline</label>
                                    <input
                                        type="text"
                                        name="headline"
                                        value={formData.creative_assets.headline}
                                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / Subheadline</label>
                                    <textarea
                                        name="description"
                                        value={formData.creative_assets.description}
                                        onChange={(e) => handleInputChange(e, 'creative_assets')}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 h-24"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                                        <input
                                            type="text"
                                            name="imageUrl"
                                            value={formData.creative_assets.imageUrl}
                                            onChange={(e) => handleInputChange(e, 'creative_assets')}
                                            placeholder="https://..."
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {formData.type === 'traffic' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination URL</label>
                                            <input
                                                type="text"
                                                name="destination_url"
                                                value={formData.destination_url}
                                                onChange={handleInputChange}
                                                placeholder="/blogs/..."
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {/* End date optional */}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setActiveTab('list')}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                            >
                                Create Campaign
                            </button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    );
};

export default CampaignManagerPage;
