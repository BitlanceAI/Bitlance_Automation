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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
            <div className="bg-[#070707] border border-[#333] shadow-[8px_8px_0_0_#26cece] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header with Progress */}
                <div className="p-6 border-b border-[#333] bg-[#111111]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight pl-3 border-l-4 border-[#26cece]">
                            Schedule Transmission
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 border border-transparent hover:border-[#333] hover:text-red-500 hover:bg-red-500/10 text-gray-500 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Step Progress Bar */}
                    <div className="flex items-center justify-between px-2">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 border flex items-center justify-center text-[10px] font-bold transition-all uppercase tracking-widest ${currentStep > step.num
                                            ? 'bg-[#333] border-[#26cece] text-white'
                                            : currentStep === step.num
                                                ? 'bg-[#26cece] text-[#070707] border-[#070707] shadow-[2px_2px_0_0_#333]'
                                                : 'bg-[#111111] border-[#333] text-gray-600'
                                            }`}
                                    >
                                        {currentStep > step.num ? (
                                            <CheckCircle2 className="h-4 w-4 text-[#26cece]" />
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] uppercase font-mono tracking-widest mt-3 font-bold ${currentStep >= step.num
                                            ? 'text-[#26cece]'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-px mx-4 transition-all ${currentStep > step.num
                                            ? 'bg-[#26cece]'
                                            : 'bg-[#333]'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#070707]">
                    {children}
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-[#333] bg-[#070707] flex justify-between">
                    <button
                        onClick={() => {
                            if (currentStep > 1) setCurrentStep(currentStep - 1);
                            else onClose();
                        }}
                        className="px-6 py-3 border border-[#333] bg-[#111111] text-gray-400 hover:bg-[#333] hover:text-white transition-all font-mono uppercase tracking-widest text-[10px]"
                    >
                        {currentStep === 1 ? 'Abort' : 'Revert'}
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
                            className="px-6 py-3 bg-[#26cece] border border-[#070707] text-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[12px] hover:shadow-[4px_4px_0_0_#333] transition-all hover:-translate-y-1 flex items-center gap-2"
                        >
                            Proceed <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-[#26cece] border border-[#070707] font-bold font-['Space_Grotesk'] uppercase tracking-widest text-[#070707] hover:shadow-[4px_4px_0_0_#333] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                        >
                            {isSubmitting ? 'Transmitting...' : 'Execute Queue'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulePostModal;
