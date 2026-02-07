import React from 'react';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Schedule Post Modal - Main wrapper for the 5-step scheduling wizard
 * 
 * Props:
 * - onValidate: (step) => boolean | string - optional validation function
 *   Returns true to proceed, or a string error message to show
 */
const SchedulePostModal = ({
    isOpen,
    onClose,
    currentStep,
    setCurrentStep,
    children,
    onSubmit,
    onValidate,
    isSubmitting = false
}) => {
    if (!isOpen) return null;

    const steps = [
        { num: 1, label: 'Account' },
        { num: 2, label: 'Content' },
        { num: 3, label: 'Schedule' },
        { num: 4, label: 'Advanced' },
        { num: 5, label: 'Review' }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header with Progress */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Schedule New Post
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep > step.num
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.num
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50'
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                                            }`}
                                    >
                                        {currentStep > step.num ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium ${currentStep >= step.num
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-400'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded-full transition-all ${currentStep > step.num
                                            ? 'bg-green-500'
                                            : 'bg-gray-200 dark:bg-slate-700'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-between">
                    <button
                        onClick={() => {
                            if (currentStep > 1) setCurrentStep(currentStep - 1);
                            else onClose();
                        }}
                        className="px-6 py-3 rounded-xl border border-gray-200 dark:border-slate-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {currentStep < 5 ? (
                        <button
                            onClick={() => {
                                if (onValidate) {
                                    const result = onValidate(currentStep);
                                    if (result !== true) {
                                        toast.error(result || 'Please complete this step');
                                        return;
                                    }
                                }
                                setCurrentStep(currentStep + 1);
                            }}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            Continue <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Scheduling...' : 'Schedule Post'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulePostModal;
