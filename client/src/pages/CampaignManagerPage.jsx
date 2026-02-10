import React, { useState, useEffect } from 'react';
import {
    AwarenessForm, TrafficForm, EngagementForm, LeadGenForm,
    SalesForm, AppPromotionForm, LocalBusinessForm, RemarketingForm, OfferEventForm
} from '../components/campaigns/CampaignForms';
import {
    Target, MousePointerClick, MessageCircle, FileText,
    ShoppingBag, Smartphone, MapPin, RefreshCw, Calendar,
    Plus, BarChart2, List, Trash2, Eye, Link2, Unlink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MetaConnectModal from '../components/meta/MetaConnectModal';
// import { toast } from 'react-hot-toast'; // Assuming usage

const CampaignManagerPage = ({ embedded = false }) => {
    const { user, session } = useAuth();
    const [activeTab, setActiveTab] = useState('list'); // list, create
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Meta Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);

    // Form State
    const [selectedType, setSelectedType] = useState(null);
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

    const campaignTypes = [
        { id: 'awareness', label: 'Awareness', icon: Target, desc: 'Maximize brand visibility & reach.' },
        { id: 'traffic', label: 'Traffic', icon: MousePointerClick, desc: 'Drive clicks to website or app.' },
        { id: 'engagement', label: 'Engagement', icon: MessageCircle, desc: 'Boost likes, comments & shares.' },
        { id: 'leadgen', label: 'Leads', icon: FileText, desc: 'Collect customer details instantly.' },
        { id: 'conversion', label: 'Sales', icon: ShoppingBag, desc: 'Drive purchases & actions.' },
        { id: 'app_promotion', label: 'App Promo', icon: Smartphone, desc: 'Increase app installs & events.' },
        { id: 'local_business', label: 'Local Biz', icon: MapPin, desc: 'Drive foot traffic to stores.' },
        { id: 'remarketing', label: 'Remarketing', icon: RefreshCw, desc: 'Re-engage past visitors.' },
        { id: 'offer_event', label: 'Offers', icon: Calendar, desc: 'Promote events or discounts.' },
    ];

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
                setSelectedType(null);
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

    const renderSpecificForm = () => {
        const props = { formData, handleInputChange };
        switch (selectedType) {
            case 'awareness': return <AwarenessForm {...props} />;
            case 'traffic': return <TrafficForm {...props} />;
            case 'engagement': return <EngagementForm {...props} />;
            case 'leadgen': return <LeadGenForm {...props} />;
            case 'conversion': return <SalesForm {...props} />;
            case 'app_promotion': return <AppPromotionForm {...props} />;
            case 'local_business': return <LocalBusinessForm {...props} />;
            case 'remarketing': return <RemarketingForm {...props} />;
            case 'offer_event': return <OfferEventForm {...props} />;
            default: return null;
        }
    };

    return (
        <div className={`mx-auto ${embedded ? '' : 'p-6 max-w-7xl'}`}>
            <MetaConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={() => { setIsConnected(true); checkMetaConnection(); }}
                userToken={session?.access_token || user?.token}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {!embedded && (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaign Manager</h1>
                        <p className="text-gray-500 mt-1">Manage your internal marketing campaigns</p>
                    </div>
                )}
                <div className={`flex flex-wrap gap-2 ${embedded ? 'w-full justify-between' : ''}`}>
                    {!embedded && (
                        <button
                            onClick={() => setShowConnectModal(true)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 border transition-colors ${isConnected
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {isConnected ? <Link2 size={18} /> : <Unlink size={18} />}
                            {isConnected ? 'Facebook Connected' : 'Connect Facebook'}
                        </button>
                    )}

                    <div className="flex gap-2">
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
                                                {campaign.objective || campaign.type || 'Campaign'}
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-4xl mx-auto">
                    {!selectedType ? (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Choose Campaign Objective</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {campaignTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setFormData(prev => ({ ...prev, type: type.id }));
                                        }}
                                        className="flex flex-col items-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-lg transition-all group bg-gray-50 dark:bg-slate-900/50"
                                    >
                                        <div className="p-4 rounded-full bg-white dark:bg-slate-800 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                            <type.icon size={32} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{type.label}</h3>
                                        <p className="text-sm text-gray-500 text-center">{type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    &larr; Back
                                </button>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Create {campaignTypes.find(t => t.id === selectedType)?.label} Campaign
                                </h2>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                {renderSpecificForm()}

                                {/* Schedule - Common Logic */}
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
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab('list'); setSelectedType(null); }}
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
            )}
        </div>
    );
};

export default CampaignManagerPage;
