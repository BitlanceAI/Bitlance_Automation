import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BookingModal = ({ isOpen, onClose }) => {
    const [step, setStep] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        revenue: '',
        goals: ''
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setStep(1); // Reset to step 1 on open
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send data to backend
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStep(2);
            } else {
                console.error('Failed to submit lead');
                // Optional: Show error message
                setStep(2); // Fallback to allow booking even if lead save fails
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setStep(2); // Fallback
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {step === 1 ? 'Tell us about your business' : 'Schedule your Demo'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {step === 1 ? (
                        <div className="p-6 sm:p-10 max-w-2xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                            placeholder="Anurag Dhole"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                            placeholder="bitlance@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            required
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Revenue (Est.)</label>
                                    <select
                                        name="revenue"
                                        value={formData.revenue}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                    >
                                        <option value="">Select Revenue Range</option>
                                        <option value="< $10k">Less than 10k</option>
                                        <option value="$10k - $50k">10k - 50k</option>
                                        <option value="$50k - $200k">50k - 200k</option>
                                        <option value="$200k+">200k+</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What are you looking to automate?</label>
                                    <textarea
                                        name="goals"
                                        rows="3"
                                        value={formData.goals}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
                                        placeholder="E.g. Customer support, lead qualification, appointment setting..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 group"
                                >
                                    {loading ? 'Processing...' : 'Continue to Booking'}
                                </button>
                                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    Your information is secure. We'll use it to prepare for our call.
                                </p>
                            </form>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-white">
                            <iframe
                                src="https://calendly.com/bitlanceai/task-regarding"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                title="Calendly Scheduling Page"
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
