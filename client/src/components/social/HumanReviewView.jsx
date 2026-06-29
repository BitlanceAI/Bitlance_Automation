import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Edit, Calendar, Hash, Image as ImageIcon, Sparkles, Eye } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { supabase } from '../../services/supabaseClient';

const BundleCard = ({ bundle, handleApprove, handleReject, handleEdit, onImageClick }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-all hover:border-white/20 group">
            {/* Graphic Section */}
            <div className="w-full relative bg-black/50 aspect-square shrink-0 border-b border-white/10 overflow-hidden">
                {bundle.graphic_asset?.file_url ? (
                    <>
                        <img src={bundle.graphic_asset.file_url} alt="Post Graphic" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]"
                            onClick={() => onImageClick(bundle.graphic_asset.file_url)}
                        >
                            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center border border-white/10 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                                <Eye className="w-5 h-5 text-white/90" />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-white/20" />
                    </div>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[#26cece]" />
                    <span className="text-[10px] font-mono text-white tracking-wider uppercase">
                        {new Date(bundle.scheduled_for).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono uppercase tracking-wider">
                            {bundle.strategy_used?.angle}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-2">{bundle.strategy_used?.topic}</h3>
                    </div>
                </div>

                <div className="flex-1 bg-black/20 rounded-xl p-4 mb-4">
                    <div className={`relative ${!expanded ? 'max-h-32 overflow-hidden' : ''}`}>
                        <p className="text-sm text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
                            {bundle.generated_caption}
                        </p>
                        {!expanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        )}
                    </div>
                    {bundle.generated_caption?.length > 150 && (
                        <button 
                            onClick={() => setExpanded(!expanded)} 
                            className="mt-2 text-[#26cece] text-xs font-mono uppercase tracking-wider hover:text-white transition-colors"
                        >
                            {expanded ? 'View Less' : 'View More'}
                        </button>
                    )}
                    
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {bundle.generated_hashtags.map((tag, idx) => (
                            <span key={idx} className="text-[#26cece] text-xs font-mono">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                    <button 
                        onClick={() => handleReject(bundle.id)}
                        className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button 
                        onClick={() => handleEdit(bundle.id)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleApprove(bundle.id)}
                        className="flex-1 py-2.5 bg-[#26cece] hover:bg-[#1db8b8] text-black rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

const HumanReviewView = () => {
    const [pendingBundles, setPendingBundles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const { activeWorkspace } = useWorkspace();

    useEffect(() => {
        if (activeWorkspace?.id) {
            fetchPendingBundles(activeWorkspace.id);
        }
    }, [activeWorkspace]);

    const fetchPendingBundles = async (workspaceId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`/api/agent/bundles/pending?workspace_id=${workspaceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': workspaceId
                }
            });
            const result = await response.json();
            if (result.success) {
                setPendingBundles(result.data);
            }
        } catch (error) {
            console.error('Error fetching bundles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            await fetch(`/api/agent/bundles/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': activeWorkspace?.id || 'default_workspace'
                },
                body: JSON.stringify({ status: 'approved' })
            });
            setPendingBundles(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error approving bundle:', error);
        }
    };

    const handleReject = async (id) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            await fetch(`/api/agent/bundles/${id}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-workspace-id': activeWorkspace?.id || 'default_workspace'
                },
                body: JSON.stringify({ status: 'rejected' })
            });
            setPendingBundles(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error('Error rejecting bundle:', error);
        }
    };

    const handleEdit = (id) => {
        // TODO: Open an edit modal
        console.log('Editing bundle:', id);
        alert('Edit functionality coming soon!');
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto h-full overflow-y-auto">
            <div className="mb-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-white tracking-tight uppercase">Approval Queue</h1>
                        <p className="text-teal-50/70 font-mono text-sm mt-1">Review, edit, or approve content generated by the AI Agent.</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-mono text-sm text-white/80">
                    <span className="text-[#26cece] font-bold">{pendingBundles.length}</span> Pending
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-[#26cece]/30 border-t-[#26cece] rounded-full animate-spin"></div>
                </div>
            ) : pendingBundles.length === 0 ? (
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Sparkles className="w-8 h-8 text-white/30" />
                    </div>
                    <h3 className="text-xl font-bold font-['Space_Grotesk'] text-white mb-2">You're all caught up!</h3>
                    <p className="text-white/50 font-mono text-sm max-w-md">There are no pending posts in the queue. Trigger the AI Agent to generate more content.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {pendingBundles.map(bundle => (
                        <BundleCard 
                            key={bundle.id} 
                            bundle={bundle} 
                            handleApprove={handleApprove} 
                            handleReject={handleReject} 
                            handleEdit={handleEdit}
                            onImageClick={setSelectedImage}
                        />
                    ))}
                </div>
            )}

            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default HumanReviewView;
