import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import MetaPixel from '../../utils/MetaPixel';

export const SalesLanding = () => {
    const { campaignId } = useParams();

    useEffect(() => {
        MetaPixel.track('PageView');
        MetaPixel.track('ViewContent', {
            content_name: 'Premium Product',
            content_ids: ['prod_123'],
            content_type: 'product',
            value: 49.99,
            currency: 'USD'
        });
    }, [campaignId]);

    const handlePurchase = async () => {
        // Simulate Purchase
        await MetaPixel.track('Purchase', {
            content_ids: ['prod_123'],
            content_type: 'product',
            value: 49.99,
            currency: 'USD',
            num_items: 1
        });
        alert('Purchase Event Fired! (Simulation)');
    };

    return (
        <LandingLayout>
            <div className="py-16 container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-full md:w-1/2">
                        <div className="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                            Product Image 500x500
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 space-y-6">
                        <h1 className="text-4xl font-bold text-gray-900">Premium Solution Pro</h1>
                        <div className="text-2xl text-blue-600 font-bold">$49.99</div>
                        <p className="text-gray-600 text-lg">
                            The ultimate solution to your problems. High quality, reliable, and efficient.
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center gap-2">✓ Feature One</li>
                            <li className="flex items-center gap-2">✓ Feature Two</li>
                            <li className="flex items-center gap-2">✓ Feature Three</li>
                        </ul>
                        <button
                            onClick={handlePurchase}
                            className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </LandingLayout>
    );
};

export default SalesLanding;
