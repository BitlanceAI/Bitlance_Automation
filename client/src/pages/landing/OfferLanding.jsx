import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import MetaPixel from '../../utils/MetaPixel';

export const OfferLanding = () => {
    const { campaignId } = useParams();
    const [claimed, setClaimed] = useState(false);

    useEffect(() => {
        MetaPixel.track('PageView');
        MetaPixel.track('ViewContent', { content_name: 'Special Offer', content_ids: [campaignId] });
    }, [campaignId]);

    const handleClaim = () => {
        MetaPixel.track('Lead', {
            content_name: 'Claimed Offer',
            value: 50.00,
            currency: 'USD'
        });
        setClaimed(true);
    };

    return (
        <LandingLayout>
            <div className="bg-indigo-900 text-white min-h-[60vh] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="text-center p-8 z-10 max-w-2xl">
                    <div className="inline-block bg-yellow-400 text-black font-bold px-3 py-1 rounded-full mb-4 text-sm animate-pulse">
                        LIMITED TIME OFFER
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-6">50% OFF Annual Plans</h1>
                    <p className="text-xl text-indigo-200 mb-8">
                        Get access to all premium features for half the price. Offer ends soon!
                    </p>

                    {!claimed ? (
                        <button
                            onClick={handleClaim}
                            className="bg-white text-indigo-900 text-xl font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-xl"
                        >
                            Claim Offer Now
                        </button>
                    ) : (
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                            <h3 className="text-2xl font-bold mb-2">Offer Claimed!</h3>
                            <p className="text-indigo-200">Use code <span className="font-mono bg-black/30 px-2 py-1 rounded text-white">SAVE50</span> at checkout.</p>
                        </div>
                    )}

                    <div className="mt-8 text-sm opacity-60">
                        *Terms and conditions apply. Valid for new customers only.
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default OfferLanding;
