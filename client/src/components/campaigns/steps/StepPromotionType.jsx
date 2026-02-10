import React from 'react';
import { Megaphone, Target, Heart, UserPlus, ShoppingCart, Smartphone, MapPin, Users, Gift } from 'lucide-react';

const PROMOTION_TYPES = [
    { id: 'AWARENESS', name: 'Awareness', description: 'Reach new audiences', icon: Megaphone, color: 'bg-blue-500' },
    { id: 'TRAFFIC', name: 'Traffic', description: 'Drive website visits', icon: Target, color: 'bg-green-500' },
    { id: 'ENGAGEMENT', name: 'Engagement', description: 'Boost post interactions', icon: Heart, color: 'bg-pink-500' },
    { id: 'LEAD_GENERATION', name: 'Lead Generation', description: 'Collect leads via forms', icon: UserPlus, color: 'bg-purple-500' },
    { id: 'SALES', name: 'Sales', description: 'Drive purchases', icon: ShoppingCart, color: 'bg-orange-500' },
    { id: 'APP_PROMOTION', name: 'App Promotion', description: 'Get app installs', icon: Smartphone, color: 'bg-cyan-500' },
    { id: 'LOCAL_BUSINESS', name: 'Local Business', description: 'Reach nearby customers', icon: MapPin, color: 'bg-red-500' },
    { id: 'REMARKETING', name: 'Remarketing', description: 'Re-engage past visitors', icon: Users, color: 'bg-indigo-500' },
    { id: 'OFFER_EVENT', name: 'Offers & Events', description: 'Promote time-sensitive deals', icon: Gift, color: 'bg-yellow-500' },
];

const StepPromotionType = ({ formData, updateFormData }) => {
    const handleSelect = (typeId) => {
        updateFormData(null, { promotionType: typeId });
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Select Promotion Type</h2>
            <p className="text-gray-500 mb-6">Choose the goal for your campaign. This determines how Meta will optimize your ads.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PROMOTION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = formData.promotionType === type.id;
                    return (
                        <button
                            key={type.id}
                            onClick={() => handleSelect(type.id)}
                            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
                                ${isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900">{type.name}</h3>
                            <p className="text-sm text-gray-500">{type.description}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StepPromotionType;
