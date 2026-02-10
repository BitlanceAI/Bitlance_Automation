import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import MetaPixel from '../../utils/MetaPixel';

export const AwarenessLanding = () => {
    const { campaignId } = useParams();

    useEffect(() => {
        MetaPixel.track('PageView');
        // Simple ViewContent for awareness
        MetaPixel.track('ViewContent', { content_name: 'Brand Story', content_ids: [campaignId] });
    }, [campaignId]);

    return (
        <LandingLayout>
            <div className="relative bg-gray-900 text-white py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">The Future of Automation</h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-200">
                        Discover how we are changing the landscape of digital marketing with AI-driven solutions.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-bold mb-3">Key Benefit {i}</h3>
                            <p className="text-gray-600">
                                Detailed explanation of this benefit and why it matters to the user.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </LandingLayout>
    );
};

export default AwarenessLanding;
