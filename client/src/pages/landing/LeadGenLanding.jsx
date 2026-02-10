import React, { useState, useEffect } from 'react'; // Fixed: Added imports
import { useParams } from 'react-router-dom';
import LandingLayout from './LandingLayout'; // Fixed: Default import
import MetaPixel from '../../utils/MetaPixel'; // Fixed: Default import

export const LeadGenLanding = () => {
    const { campaignId } = useParams();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' }); // Fixed: Added phone

    useEffect(() => {
        // Init Pixel (Replace with actual ID from campaign config ideally, or global env)
        // MetaPixel.init('YOUR_PIXEL_ID'); 
        MetaPixel.track('PageView');
        MetaPixel.track('ViewContent', { content_name: 'Lead Gen Campaign', content_ids: [campaignId] });
    }, [campaignId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Simmsulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Track Lead
        await MetaPixel.track('Lead', {
            content_name: 'Lead Gen Campaign',
            content_category: 'Signup',
            value: 10.00,
            currency: 'USD'
        }, {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.name.split(' ')[0],
            lastName: formData.name.split(' ').slice(1).join(' ')
        });

        setSubmitted(true);
    };

    return (
        <LandingLayout>
            <div className="bg-blue-600 py-20 text-white text-center">
                <h1 className="text-4xl font-bold mb-4">Unlock Exclusive Access</h1>
                <p className="text-xl opacity-90">Join thousands of others getting the best tips.</p>
            </div>

            <div className="container mx-auto px-4 -mt-10">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                Get Access Now
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-4">
                                By signing up, you agree to our Terms. Your data is safe.
                            </p>
                        </form>
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">You're In!</h2>
                            <p className="text-gray-600">Check your inbox for the next steps.</p>
                        </div>
                    )}
                </div>
            </div>
        </LandingLayout>
    );
};

export default LeadGenLanding;
