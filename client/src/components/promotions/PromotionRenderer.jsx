import React, { useEffect, useState } from 'react';
import AwarenessBanner from './AwarenessBanner';
import TrafficCard from './TrafficCard';
import EngagementWidget from './EngagementWidget';
import LeadForm from './LeadForm';

// Mapping campaign types to components
const ComponentMap = {
    awareness: AwarenessBanner,
    traffic: TrafficCard,
    engagement: EngagementWidget,
    leadgen: LeadForm,
    // Add others as implemented
};

const PromotionRenderer = ({ context = 'default', type }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                // In production, use axios or fetch wrapper with auth headers if needed
                const queryParams = new URLSearchParams({
                    context,
                    ...(type && { type })
                });

                const res = await fetch(`/api/campaigns/serve?${queryParams}`);
                const data = await res.json();

                if (data.success && data.campaign) {
                    setCampaign(data.campaign);
                }
            } catch (error) {
                console.error('Failed to fetch promotion:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [context, type]);

    const handleImpression = async () => {
        if (!campaign) return;
        try {
            await fetch('/api/campaigns/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    action: `${campaign.objective}_impression`,
                    properties: { context }
                })
            });
        } catch (err) {
            console.error('Track impression error:', err);
        }
    };

    const handleInteraction = async (actionType, data) => {
        if (!campaign) return;
        try {
            await fetch('/api/campaigns/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    action: `${campaign.objective}_${actionType}`, // e.g., engagement_like
                    properties: { ...data, context }
                })
            });
        } catch (err) {
            console.error('Track interaction error:', err);
        }
    };

    if (loading || !campaign) return null;

    const Component = ComponentMap[type || campaign.objective] || ComponentMap.awareness; // Fallback

    // Logic to select variant or pass specific props could go here
    const variant = context === 'hero' ? 'hero' : 'inline';

    return (
        <div className="promotion-container my-6">
            <Component
                campaign={campaign}
                variant={variant}
                onImpression={handleImpression}
                onEngage={(type) => handleInteraction(type)}
                onClick={(url) => handleInteraction('click', { destination: url })}
                onSubmit={(data) => handleInteraction('submit', { formData: data })}
            />
        </div>
    );
};

export default PromotionRenderer;
