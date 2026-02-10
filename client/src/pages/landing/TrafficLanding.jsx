import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LandingLayout from './LandingLayout';
import MetaPixel from '../../utils/MetaPixel';

export const TrafficLanding = () => {
    const { campaignId } = useParams();

    useEffect(() => {
        MetaPixel.track('PageView');
        MetaPixel.track('ViewContent', { content_category: 'Blog', content_ids: [campaignId] });
    }, [campaignId]);

    return (
        <LandingLayout>
            <div className="container mx-auto px-4 py-12 max-w-3xl">
                <span className="text-blue-600 font-bold tracking-wide uppercase text-sm">Latest Insights</span>
                <h1 className="text-4xl font-bold mt-2 mb-6 text-gray-900 leading-tight">
                    10 Ways to Automate Your Business in 2026
                </h1>
                <div className="flex items-center space-x-4 mb-8 text-gray-500 text-sm">
                    <img src="https://ui-avatars.com/api/?name=Admin" alt="Author" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-medium text-gray-900">By Admin Team</p>
                        <p>Feb 10, 2026 · 5 min read</p>
                    </div>
                </div>

                <img
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Cover"
                    className="w-full h-64 md:h-96 object-cover rounded-xl mb-10 shadow-lg"
                />

                <article className="prose prose-lg prose-blue mx-auto text-gray-700">
                    <p>
                        Automation is no longer a luxury, it's a necessity. In this article, we explore the top strategies...
                        (Content placeholder needs real data from campaign or CMS)
                    </p>
                    <h2>1. Use AI Agents</h2>
                    <p>AI agents can handle customer support, lead qualification, and even content creation.</p>
                    <h2>2. Optimize Ad Spend</h2>
                    <p>Using tools like our Meta Ads Manager helps you get the best ROI.</p>
                    <div className="bg-blue-50 p-6 rounded-xl my-8 border-l-4 border-blue-600">
                        <h4 className="font-bold text-blue-900">Want to implementing this?</h4>
                        <p className="my-2">Book a free consultation call with our experts today.</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 font-medium hover:bg-blue-700">Book Now</button>
                    </div>
                </article>
            </div>
        </LandingLayout>
    );
};

export default TrafficLanding;
