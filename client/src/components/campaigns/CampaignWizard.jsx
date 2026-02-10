import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StepPromotionType from './steps/StepPromotionType';
import StepContent from './steps/StepContent';
import StepBudgetSchedule from './steps/StepBudgetSchedule';
import StepReview from './steps/StepReview';

const STEPS = ['Promotion Type', 'Content', 'Budget & Schedule', 'Review'];

const API_BASE = import.meta.env.VITE_API_URL || '';

const CampaignWizard = () => {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        promotionType: '',
        name: '',
        adAccountId: '',
        pageId: '',
        creative: {
            text: '',
            headline: '',
            description: '',
            destination_url: '',
            image_url: '',
            cta_type: 'LEARN_MORE'
        },
        budget: {
            daily_amount: 10,
            currency: 'USD'
        },
        schedule: {
            start_time: '',
            end_time: ''
        },
        targeting: {
            geo_locations: { countries: ['US'] },
            age_min: 18,
            age_max: 65
        },
        pixelId: ''
    });

    const updateFormData = (section, data) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], ...data }
            }));
        } else {
            setFormData(prev => ({ ...prev, ...data }));
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE}/api/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to create campaign');

            const result = await response.json();
            alert('Campaign created successfully!');
            navigate('/admin/campaigns');
        } catch (error) {
            console.error('Submit Error:', error);
            alert('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <StepPromotionType formData={formData} updateFormData={updateFormData} />;
            case 1:
                return <StepContent formData={formData} updateFormData={updateFormData} />;
            case 2:
                return <StepBudgetSchedule formData={formData} updateFormData={updateFormData} />;
            case 3:
                return <StepReview formData={formData} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
            <p className="text-gray-500 mb-8">Follow the steps to set up your Meta ad campaign.</p>

            {/* Progress Indicator */}
            <div className="flex items-center mb-10">
                {STEPS.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                            ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index + 1}
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex justify-between mb-6 text-sm text-gray-600">
                {STEPS.map((step, index) => (
                    <span key={step} className={index === currentStep ? 'font-bold text-blue-600' : ''}>{step}</span>
                ))}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[400px]">
                {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    Back
                </button>

                {currentStep < STEPS.length - 1 ? (
                    <button
                        onClick={nextStep}
                        disabled={!formData.promotionType && currentStep === 0}
                        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Creating...' : 'Launch Campaign'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CampaignWizard;
