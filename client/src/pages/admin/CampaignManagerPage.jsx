import React, { useState, useEffect } from 'react';
import {
    AwarenessForm, TrafficForm, EngagementForm, LeadGenForm,
    SalesForm, AppPromotionForm, LocalBusinessForm, RemarketingForm, OfferEventForm
} from '../../components/campaigns/CampaignForms';
import {
    Target, MousePointerClick, MessageCircle, FileText,
    ShoppingBag, Smartphone, MapPin, RefreshCw, Calendar,
    Plus, BarChart2, List, Trash2, Eye, Link2, Unlink, X, Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MetaConnectModal from '../../components/meta/MetaConnectModal';
import { toast } from 'react-hot-toast';

import API_BASE_URL from '../../config';

const CampaignManagerPage = ({ embedded = false }) => {
    const { user, session } = useAuth();
    const [activeTab, setActiveTab] = useState('list'); // list, create
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Meta Connection State
    const [isConnected, setIsConnected] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [availablePages, setAvailablePages] = useState([]);

    // Form State
    const [selectedType, setSelectedType] = useState(null);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedStats, setSelectedStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // View Campaign State
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // Graphic Generator State
    const [showGraphicModal, setShowGraphicModal] = useState(false);
    const [graphics, setGraphics] = useState([]);
    const [graphicsLoading, setGraphicsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'awareness', // awareness, traffic, engagement, leadgen
        objective: 'brand_awareness',
        status: 'draft',
        page_id: '',
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
        budget: '',
        targeting: {
            locations: '',
            age_min: 18,
            age_max: 65,
            gender: 'ALL',
            interests: ''
        },
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
            const res = await fetch(`${API_BASE_URL}/api/meta/connection`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.connected && data.isValid) {
                setIsConnected(true);
                setAvailablePages(data.pages || []);
            } else {
                setIsConnected(false);
                setAvailablePages([]);
            }
        } catch (error) {
            console.error('Meta connection check failed:', error);
        }
    };

    const fetchCampaigns = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
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

    const handleViewStats = async (campaign) => {
        setSelectedStats(null);
        setShowStatsModal(true);
        setStatsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns/${campaign.id}/stats`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setSelectedStats(data.stats);
            } else {
                // toast.error(data.error || 'Failed to load stats');
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleViewCampaign = (campaign) => {
        setSelectedCampaign(campaign);
        setShowViewModal(true);
    };

    const handleDeleteCampaign = async (id) => {
        if (!window.confirm('Are you sure you want to delete this campaign?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Campaign deleted successfully');
                fetchCampaigns();
            } else {
                toast.error(data.error || 'Failed to delete campaign');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Network error while deleting');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/campaigns`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                // Check Meta sync status
                if (data.meta_result?.success) {
                    toast.success('Campaign created and synced to Meta!');
                } else {
                    toast.success('Campaign created locally!');
                    if (data.meta_result?.error) {
                        toast.error(`Meta Sync Failed: ${data.meta_result.error}`, { duration: 6000 });
                    } else {
                        toast('Saved as Local Draft (Not synced)', { icon: '⚠️' });
                    }
                }

                setActiveTab('list');
                setSelectedType(null);
                fetchCampaigns();
                // Reset form
                setFormData({
                    ...formData,
                    name: '',
                    budget: '',
                    creative_assets: {
                        ...formData.creative_assets,
                        headline: '',
                        imageUrl: ''
                    }
                });
            } else {
                toast.error(data.error || 'Failed to create campaign');
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            toast.error('Network error: ' + error.message);
        }
    };

    const fetchGraphics = async () => {
        try {
            setGraphicsLoading(true);
            const token = session?.access_token || user?.token;
            const res = await fetch(`${API_BASE_URL}/api/design/jobs`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                // Filter for completed jobs with flyer_url
                const validGraphics = data.jobs?.filter(job => job.status === 'completed' && job.flyer_url) || [];
                setGraphics(validGraphics);
            }
        } catch (error) {
            console.error('Failed to load graphics:', error);
        } finally {
            setGraphicsLoading(false);
        }
    };

    const handleGraphicSelect = (url) => {
        setFormData({
            ...formData,
            creative_assets: {
                ...formData.creative_assets,
                imageUrl: url
            }
        });
        setShowGraphicModal(false);
    };

    const handleOpenGraphicModal = () => {
        setShowGraphicModal(true);
        fetchGraphics();
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
        const props = { formData, handleInputChange, onOpenGraphicModal: handleOpenGraphicModal, availablePages };
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
        <div className={`mx-auto font-mono ${embedded ? '' : 'p-6 lg:p-10 max-w-7xl'}`}>
            <MetaConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onSuccess={() => { setIsConnected(true); checkMetaConnection(); }}
                userToken={session?.access_token || user?.token}
            />

            {/* Graphic Selection Modal */}
            {showGraphicModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#333] bg-[#111111]">
                            <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight border-l-4 border-[#26cece] pl-3">Select Graphic Asset</h3>
                            <button
                                onClick={() => setShowGraphicModal(false)}
                                className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#070707]">
                            {graphicsLoading ? (
                                <div className="flex justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-[#26cece]" />
                                </div>
                            ) : graphics.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-[#333] bg-[#111111]">
                                    <Image size={48} className="mx-auto mb-4 text-[#333]" />
                                    <p className="text-[12px] font-mono tracking-widest uppercase text-gray-500">No generated graphics found.</p>
                                    <p className="text-[10px] mt-2 font-mono tracking-widest text-[#26cece] uppercase">&gt; Generate assets in the Design Studio first.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {graphics.map((job) => (
                                        <div
                                            key={job.id}
                                            onClick={() => handleGraphicSelect(job.flyer_url)}
                                            className="group relative cursor-pointer overflow-hidden border border-[#333] bg-[#111111] hover:border-[#26cece] transition-all aspect-[4/5]"
                                        >
                                            <img
                                                src={job.flyer_url}
                                                alt={`Job ${job.id}`}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 grayscale group-hover:grayscale-0"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-[#070707]/90 text-white text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity border-t border-[#333]">
                                                {job.property_type} <span className="text-[#26cece]">|</span> {new Date(job.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {!embedded && (
                    <div className="border-b border-[#333] pb-6 w-full md:w-auto">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight mb-2">Campaign Manager</h1>
                        <p className="text-[#26cece] text-[10px] uppercase tracking-widest bg-[#26cece]/10 inline-block px-2 py-1">&gt; Control structural marketing pipelines</p>
                    </div>
                )}
                <div className={`flex flex-wrap gap-2 ${embedded ? 'w-full justify-between' : ''}`}>
                    {!embedded && (
                        <button
                            onClick={() => setShowConnectModal(true)}
                            className={`px-4 py-3 flex items-center gap-2 border text-[10px] uppercase font-bold tracking-widest font-mono transition-all ${isConnected
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-[#111111] text-gray-500 border-[#333] hover:border-[#26cece] hover:text-[#26cece]'}`}
                        >
                            {isConnected ? <Link2 size={16} /> : <Unlink size={16} />}
                            {isConnected ? 'Meta Connected' : 'Connect Meta'}
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-6 py-3 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all border ${activeTab === 'list' ? 'bg-[#26cece] text-[#070707] border-[#26cece] shadow-[4px_4px_0_0_#333] -translate-y-1' : 'bg-[#111111] text-gray-500 border-[#333] hover:border-[#26cece] hover:text-white'}`}
                        >
                            <List size={16} /> Registry
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`px-6 py-3 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase transition-all border ${activeTab === 'create' ? 'bg-[#26cece] text-[#070707] border-[#26cece] shadow-[4px_4px_0_0_#333] -translate-y-1' : 'bg-[#111111] text-gray-500 border-[#333] hover:border-[#26cece] hover:text-white'}`}
                        >
                            <Plus size={16} /> Construct New
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'list' ? (
                <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-[10px] uppercase tracking-widest font-mono text-gray-500 border-b border-[#333]">Syncing structural data...</div>
                    ) : campaigns.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-[12px] text-gray-500 font-mono tracking-widest uppercase mb-4">&gt; No active campaigns logged.</p>
                            <button onClick={() => setActiveTab('create')} className="px-6 py-3 border border-[#26cece] text-[#26cece] text-[10px] font-bold tracking-widest uppercase hover:bg-[#26cece] hover:text-[#070707] transition-all">Initialize First Sequence</button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#111111] border-b border-[#333] text-gray-500 text-[10px] uppercase font-mono tracking-widest">
                                        <th className="p-4 md:p-5 border-r border-[#333]">Designation</th>
                                        <th className="p-4 md:p-5 border-r border-[#333]">Objective Class</th>
                                        <th className="p-4 md:p-5 border-r border-[#333]">State</th>
                                        <th className="p-4 md:p-5 border-r border-[#333]">Timestamp</th>
                                        <th className="p-4 md:p-5">Terminals</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#333]">
                                    {campaigns.map(campaign => (
                                        <tr key={campaign.id} className="hover:bg-[#111111] transition-colors group">
                                            <td className="p-4 md:p-5 border-r border-[#333] font-bold font-['Space_Grotesk'] text-white text-base tracking-tight uppercase group-hover:text-[#26cece] transition-colors">{campaign.name}</td>
                                            <td className="p-4 md:p-5 border-r border-[#333]">
                                                <span className={`px-2 py-1 text-[10px] font-mono tracking-widest bg-[#26cece]/10 text-[#26cece] uppercase border border-[#26cece]/30`}>
                                                    {campaign.objective || campaign.type || 'Campaign'}
                                                </span>
                                            </td>
                                            <td className="p-4 md:p-5 border-r border-[#333]">
                                                <span className={`px-2 py-1 flex items-center max-w-max gap-1.5 text-[10px] font-mono tracking-widest uppercase border ${campaign.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-none ${campaign.status === 'active' ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-gray-400'}`}></span>
                                                    {campaign.status || 'Draft'}
                                                </span>
                                            </td>
                                            <td className="p-4 md:p-5 border-r border-[#333] text-[#888] text-[10px] uppercase font-mono tracking-widest">
                                                {new Date(campaign.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="p-4 md:p-5">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleViewStats(campaign)}
                                                        className="p-2 border border-transparent text-gray-500 hover:text-[#26cece] hover:border-[#26cece] transition-all bg-[#111111] hover:shadow-[2px_2px_0_0_#26cece] hover:-translate-y-0.5"
                                                        title="View Analytics"
                                                    >
                                                        <BarChart2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCampaign(campaign)}
                                                        className="p-2 border border-transparent text-gray-500 hover:text-white hover:border-white transition-all bg-[#111111] hover:shadow-[2px_2px_0_0_#fff] hover:-translate-y-0.5"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                                        className="p-2 border border-transparent text-gray-500 hover:text-red-500 hover:border-red-500 transition-all bg-[#111111] hover:shadow-[2px_2px_0_0_#ef4444] hover:-translate-y-0.5"
                                                        title="Delete Campaign"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] p-6 lg:p-10 max-w-5xl mx-auto">
                    {!selectedType ? (
                        <>
                            <h2 className="text-2xl md:text-3xl font-extrabold font-['Space_Grotesk'] mb-8 text-white uppercase tracking-tight border-l-4 border-[#26cece] pl-4">Assign Protocol Objective</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {campaignTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setSelectedType(type.id);
                                            setFormData(prev => ({ ...prev, type: type.id }));
                                        }}
                                        className="flex flex-col items-center p-6 border border-[#333] hover:border-[#26cece] hover:shadow-[4px_4px_0_0_#26cece] hover:-translate-y-1 transition-all group bg-[#111111]"
                                    >
                                        <div className="p-4 border border-[#333] bg-[#070707] mb-6 group-hover:border-[#26cece] transition-colors">
                                            <type.icon size={32} className="text-[#26cece]" />
                                        </div>
                                        <h3 className="font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight text-lg mb-2">{type.label}</h3>
                                        <p className="text-[10px] font-mono tracking-widest text-[#888] text-center uppercase">&gt; {type.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div>
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 border-b border-[#333] pb-6">
                                <button
                                    onClick={() => setSelectedType(null)}
                                    className="px-4 py-2 border border-[#333] bg-[#111111] text-gray-400 hover:text-white hover:border-[#26cece] text-[10px] tracking-widest font-mono uppercase transition-all whitespace-nowrap"
                                >
                                    &lt; Revert
                                </button>
                                <div>
                                    <h2 className="text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight">
                                        Deploy {campaignTypes.find(t => t.id === selectedType)?.label} Protocol
                                    </h2>
                                    <p className="text-[#26cece] text-[10px] uppercase tracking-widest">&gt; Formulate operational parameters</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-6">
                                {renderSpecificForm()}

                                {/* Schedule - Common Logic */}
                                <div className="border-t border-[#333] pt-8">
                                    <h3 className="text-xl font-bold mb-6 text-white font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#26cece]"></span>
                                        Resource Allocation
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Daily Budget (INR)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3.5 text-[#26cece] font-mono">₹</span>
                                                <input
                                                    type="number"
                                                    name="budget"
                                                    value={formData.budget}
                                                    onChange={handleInputChange}
                                                    placeholder="500.00"
                                                    step="1"
                                                    min="85"
                                                    className="w-full pl-10 pr-4 py-3 border border-[#333] bg-[#111111] text-white placeholder-gray-600 focus:border-[#26cece] focus:outline-none focus:ring-0 transition-colors font-mono"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-widest">&gt; Minimum structural burn rate: ₹85/day</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-2">Initiation Date</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white focus:border-[#26cece] focus:outline-none focus:ring-0 transition-colors font-mono uppercase"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-8 border-t border-[#333] mt-8">
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab('list'); setSelectedType(null); }}
                                        className="px-6 py-3 border border-[#333] bg-[#111111] text-gray-400 hover:text-white hover:border-[#26cece] transition-all font-mono uppercase tracking-widest text-[10px] shadow-[4px_4px_0_0_transparent] hover:shadow-[4px_4px_0_0_#333]"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-[#26cece] border border-[#070707] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:shadow-[4px_4px_0_0_#333] transition-all hover:-translate-y-1"
                                    >
                                        Execute Campaign
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
            {/* Analytics Modal */}
            {showStatsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                    <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#333] bg-[#111111]">
                            <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight border-l-4 border-[#26cece] pl-3">Telemetry Readings</h3>
                            <button
                                onClick={() => setShowStatsModal(false)}
                                className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 bg-[#070707]">
                            {statsLoading ? (
                                <div className="flex justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-[#26cece]" />
                                </div>
                            ) : selectedStats ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Impressions', value: selectedStats.impressions, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
                                        { label: 'Clicks', value: selectedStats.clicks, color: 'text-[#26cece]', border: 'border-[#26cece]/30', bg: 'bg-[#26cece]/10' },
                                        { label: 'Conversion Rate', value: `${selectedStats.ctr}%`, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
                                        { label: 'Capital Burn', value: `₹${selectedStats.spend || '0.00'}`, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
                                    ].map((stat, i) => (
                                        <div key={i} className={`p-4 border ${stat.border} ${stat.bg} flex flex-col justify-center items-center text-center`}>
                                            <p className="text-[10px] text-white uppercase tracking-widest font-mono mb-2">{stat.label}</p>
                                            <p className={`text-2xl md:text-3xl font-bold font-['Space_Grotesk'] ${stat.color} tracking-tight`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500 text-[10px] font-mono tracking-widest uppercase border border-dashed border-[#333] bg-[#111111]">
                                    &gt; Telemetry signal lost
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Campaign Details Modal */}
            {showViewModal && selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                    <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-[#333] bg-[#111111]">
                            <div className="pl-3 border-l-4 border-[#26cece]">
                                <h3 className="text-xl md:text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight">{selectedCampaign.name}</h3>
                                <p className="text-[10px] text-[#26cece] font-mono tracking-widest uppercase mt-1">&gt; Class: {selectedCampaign.objective || selectedCampaign.type || 'Campaign'}</p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#070707] space-y-8">

                            {/* Key Value Pairs Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#111111] border border-[#333] p-4 text-center group hover:border-[#26cece] transition-colors">
                                    <h4 className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">Status</h4>
                                    <p className="text-white font-mono uppercase tracking-widest font-bold text-xs flex items-center justify-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 ${selectedCampaign.status === 'active' ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : 'bg-gray-500'}`}></span>
                                        {selectedCampaign.status || 'Draft'}
                                    </p>
                                </div>
                                <div className="bg-[#111111] border border-[#333] p-4 text-center group hover:border-[#26cece] transition-colors">
                                    <h4 className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">Burn Rate</h4>
                                    <p className="text-white font-mono text-sm tracking-widest uppercase font-bold text-center">₹{selectedCampaign.budget || '0'}/<span className="text-gray-500 text-[10px]">D</span></p>
                                </div>
                                <div className="bg-[#111111] border border-[#333] p-4 text-center group hover:border-[#26cece] transition-colors">
                                    <h4 className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">T-Zero</h4>
                                    <p className="text-[#26cece] font-mono uppercase tracking-widest text-[10px] font-bold mt-1">
                                        {selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toISOString().split('T')[0] : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-[#111111] border border-[#333] p-4 text-center group hover:border-[#26cece] transition-colors">
                                    <h4 className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase mb-1">Creation Sync</h4>
                                    <p className="text-gray-400 font-mono uppercase tracking-widest text-[10px] font-bold mt-1">
                                        {new Date(selectedCampaign.created_at).toISOString().split('T')[0]}
                                    </p>
                                </div>
                            </div>

                            {selectedCampaign.creative_assets && (
                                <div>
                                    <h4 className="text-sm font-bold font-mono text-[#26cece] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#26cece]"></span>
                                        Payload Data
                                    </h4>
                                    <div className="bg-[#111111] border border-[#333] p-5 space-y-5 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#26cece]/5 rotate-45 transform translate-x-16 -translate-y-16 pointer-events-none"></div>
                                        
                                        {selectedCampaign.creative_assets.headline && (
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block mb-1">Headline</span>
                                                <p className="text-white font-['Space_Grotesk'] text-lg md:text-xl font-bold">{selectedCampaign.creative_assets.headline}</p>
                                            </div>
                                        )}
                                        {selectedCampaign.creative_assets.description && (
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block mb-2">Description</span>
                                                <p className="text-gray-300 font-mono text-xs whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-[#333]">{selectedCampaign.creative_assets.description}</p>
                                            </div>
                                        )}
                                        {selectedCampaign.creative_assets.imageUrl && (
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block mb-2">Media Asset</span>
                                                <div className="border border-[#333] p-2 inline-block bg-[#070707] hover:border-[#26cece] transition-colors">
                                                    <img src={selectedCampaign.creative_assets.imageUrl} alt="Campaign Creative" className="max-w-[200px] h-auto object-cover grayscale hover:grayscale-0 transition-all" />
                                                </div>
                                            </div>
                                        )}
                                        {selectedCampaign.creative_assets.ctaText && (
                                            <div>
                                                <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest block mb-1">Interaction Module</span>
                                                <span className="inline-block px-3 py-1.5 bg-[#26cece] text-[#070707] text-[10px] font-bold uppercase tracking-widest border border-[#26cece] shadow-[2px_2px_0_0_#333]">
                                                    {selectedCampaign.creative_assets.ctaText}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedCampaign.destination_url && (
                                <div>
                                    <h4 className="text-sm font-bold font-mono text-[#26cece] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-[#26cece]"></span>
                                        Redirection Vector
                                    </h4>
                                    <a href={selectedCampaign.destination_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 p-4 border border-[#333] bg-[#111111] text-white hover:text-[#070707] hover:bg-[#26cece] hover:border-[#26cece] transition-all font-mono text-xs break-all group shadow-[4px_4px_0_0_transparent] hover:shadow-[4px_4px_0_0_#333]">
                                        <Link2 size={16} className="group-hover:text-[#070707]" />
                                        {selectedCampaign.destination_url}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignManagerPage;
