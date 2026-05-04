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
        <div className="space-y-8 font-mono">
            <h4 className="text-xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-3 border-l-4 border-[#26cece] pl-3 mb-6">
                <Settings className="h-5 w-5 text-[#26cece]" /> Configuration Matrix
            </h4>

            {/* Target Audience Section */}
            <div className="p-6 md:p-8 bg-[#070707] border border-[#333]">
                <h5 className="font-bold font-['Space_Grotesk'] text-[#26cece] uppercase tracking-widest mb-6 flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4" /> Target Audience Parameters
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Age Range */}
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-3">
                            Age Vector Range
                        </label>
                        <div className="flex items-center gap-3">
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
                                className="w-20 px-3 py-3 border border-[#333] bg-[#111111] text-white text-center font-mono focus:border-[#26cece] focus:outline-none transition-colors"
                            />
                            <span className="text-gray-500 font-bold">&gt;</span>
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
                                className="w-20 px-3 py-3 border border-[#333] bg-[#111111] text-white text-center font-mono focus:border-[#26cece] focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-3">
                            Demographic Signature
                        </label>
                        <select
                            value={targetAudience?.gender || 'all'}
                            onChange={(e) =>
                                onTargetChange({
                                    ...targetAudience,
                                    gender: e.target.value
                                })
                            }
                            className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white font-mono focus:border-[#26cece] focus:outline-none transition-colors"
                        >
                            <option value="all">ALL</option>
                            <option value="male">MALE</option>
                            <option value="female">FEMALE</option>
                        </select>
                    </div>

                    {/* Locations */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-3">
                            Geospatial Coordinates (comma separated)
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
                            placeholder="&gt; e.g., Mumbai, Delhi, Bangalore"
                            className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white font-mono focus:border-[#26cece] focus:outline-none transition-colors placeholder-gray-600 text-sm"
                        />
                    </div>

                    {/* Interests */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-mono tracking-widest text-gray-500 uppercase mb-3">
                            Behavioral Vectors (comma separated)
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
                            placeholder="&gt; e.g., Real Estate, Investment, Property"
                            className="w-full px-4 py-3 border border-[#333] bg-[#111111] text-white font-mono focus:border-[#26cece] focus:outline-none transition-colors placeholder-gray-600 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="p-6 md:p-8 bg-[#070707] border border-[#333]">
                <h5 className="font-bold font-['Space_Grotesk'] text-[#26cece] uppercase tracking-widest mb-6 flex items-center gap-3 text-sm">
                    <span className="w-2 h-2 bg-[#26cece]"></span> Call to Action Matrix
                </h5>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ctaOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onCtaChange(option.value)}
                            className={`p-4 border transition-all text-[10px] font-mono uppercase tracking-widest ${callToAction === option.value
                                    ? 'border-[#26cece] bg-[#26cece]/10 text-[#26cece] font-bold shadow-[2px_2px_0_0_#26cece] -translate-y-0.5'
                                    : 'border-[#333] bg-[#111111] text-gray-500 hover:text-white hover:border-[#26cece]'
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
