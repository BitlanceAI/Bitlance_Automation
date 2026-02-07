import React from 'react';
import { Settings, Users } from 'lucide-react';

/**
 * Step 4: Advanced Options
 * Targeting options, call-to-action, etc.
 */
const StepAdvanced = ({ targetAudience, callToAction, onTargetChange, onCtaChange }) => {
    const ctaOptions = [
        { value: 'LEARN_MORE', label: 'Learn More' },
        { value: 'SHOP_NOW', label: 'Shop Now' },
        { value: 'SIGN_UP', label: 'Sign Up' },
        { value: 'BOOK_NOW', label: 'Book Now' },
        { value: 'CONTACT_US', label: 'Contact Us' },
        { value: 'DOWNLOAD', label: 'Download' },
        { value: 'GET_QUOTE', label: 'Get Quote' },
        { value: 'APPLY_NOW', label: 'Apply Now' }
    ];

    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" /> Advanced Options
            </h4>

            {/* Target Audience Section */}
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h5 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Target Audience
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age Range */}
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Age Range
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={targetAudience?.ageMin || 18}
                                onChange={(e) =>
                                    onTargetChange({
                                        ...targetAudience,
                                        ageMin: e.target.value
                                    })
                                }
                                min="13"
                                max="65"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                                type="number"
                                value={targetAudience?.ageMax || 65}
                                onChange={(e) =>
                                    onTargetChange({
                                        ...targetAudience,
                                        ageMax: e.target.value
                                    })
                                }
                                min="13"
                                max="65"
                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-center"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Gender
                        </label>
                        <select
                            value={targetAudience?.gender || 'all'}
                            onChange={(e) =>
                                onTargetChange({
                                    ...targetAudience,
                                    gender: e.target.value
                                })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        >
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    {/* Locations */}
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Locations (comma separated)
                        </label>
                        <input
                            type="text"
                            value={targetAudience?.locations || ''}
                            onChange={(e) =>
                                onTargetChange({
                                    ...targetAudience,
                                    locations: e.target.value
                                })
                            }
                            placeholder="e.g., Mumbai, Delhi, Bangalore"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Interests */}
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Interests (comma separated)
                        </label>
                        <input
                            type="text"
                            value={targetAudience?.interests || ''}
                            onChange={(e) =>
                                onTargetChange({
                                    ...targetAudience,
                                    interests: e.target.value
                                })
                            }
                            placeholder="e.g., Real Estate, Investment, Property"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h5 className="font-medium text-gray-900 dark:text-white mb-4">
                    Call to Action Button
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ctaOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onCtaChange(option.value)}
                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${callToAction === option.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                                    : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepAdvanced;
