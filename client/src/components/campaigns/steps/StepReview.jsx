import React from 'react';

const StepReview = ({ formData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-2">Review Your Campaign</h2>
            <p className="text-gray-500 mb-6">Confirm your settings before launching.</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Promotion Type */}
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Promotion Type</p>
                    <p className="text-lg font-bold text-gray-900">{formData.promotionType}</p>
                </div>

                {/* Campaign Name */}
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Campaign Name</p>
                    <p className="text-lg font-bold text-gray-900">{formData.name || 'Untitled'}</p>
                </div>

                {/* Daily Budget */}
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Daily Budget</p>
                    <p className="text-lg font-bold text-green-600">${formData.budget.daily_amount}</p>
                </div>

                {/* Schedule */}
                <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Schedule</p>
                    <p className="text-sm font-medium text-gray-900">
                        {formData.schedule.start_time ? new Date(formData.schedule.start_time).toLocaleString() : 'N/A'}
                        {' → '}
                        {formData.schedule.end_time ? new Date(formData.schedule.end_time).toLocaleString() : 'Ongoing'}
                    </p>
                </div>
            </div>

            {/* Creative Preview */}
            <div className="border rounded-xl p-6 bg-white">
                <h3 className="font-bold mb-4">Ad Creative Preview</h3>
                <div className="flex gap-6">
                    {formData.creative.image_url && (
                        <img src={formData.creative.image_url} alt="Ad" className="w-40 h-40 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                        <p className="font-bold text-lg">{formData.creative.headline || 'Headline Here'}</p>
                        <p className="text-gray-600 mt-1">{formData.creative.text || 'Primary text...'}</p>
                        <a href={formData.creative.destination_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                            {formData.creative.destination_url || 'https://...'}
                        </a>
                        <div className="mt-4">
                            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block">
                                {formData.creative.cta_type?.replace(/_/g, ' ') || 'Learn More'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800">
                <p className="font-medium">⚠️ Important</p>
                <p className="text-sm mt-1">
                    Clicking "Launch Campaign" will create the campaign in PAUSED status.
                    You can activate it from Meta Ads Manager or the dashboard.
                </p>
            </div>
        </div>
    );
};

export default StepReview;
