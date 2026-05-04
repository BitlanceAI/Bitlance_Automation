import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

const LeadForm = ({ campaign, onSubmit }) => {
    const { creative_assets: creative, form_config = {} } = campaign;
    // Default fields if not specified
    const fields = form_config.fields || [
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'fullName', label: 'Full Name', type: 'text', required: true }
    ];

    const [formData, setFormData] = useState({});
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Simulate API call or pass to parent
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
            if (onSubmit) await onSubmit(formData);
            setStatus('success');
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">Thank You!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    {form_config.successMessage || 'We have received your details. We will be in touch shortly.'}
                </p>
                {/* Optional download link if it's a lead magnet */}
                {creative.assetUrl && (
                    <a
                        href={creative.assetUrl}
                        className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                        download
                    >
                        Download Resource
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden max-w-md w-full mx-auto">
            {/* Form Header */}
            <div className="bg-gray-50 dark:bg-slate-700/50 p-6 border-b border-gray-100 dark:border-gray-700 text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{creative.headline || 'Sign Up'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{creative.description}</p>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {fields.map((field) => (
                    <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={field.type}
                            name={field.name}
                            required={field.required}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}

                {/* Privacy Consent */}
                <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
                    <input type="checkbox" required className="mt-0.5 rounded border-gray-300" />
                    <span>
                        I agree to the <a href="#" className="underline">Privacy Policy</a> and consent to receive updates.
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {status === 'submitting' ? (
                        <>
                            <Loader2 className="animate-spin w-4 h-4" /> Processing...
                        </>
                    ) : (
                        form_config.submitButtonText || 'Submit'
                    )}
                </button>
            </form>
        </div>
    );
};

export default LeadForm;
