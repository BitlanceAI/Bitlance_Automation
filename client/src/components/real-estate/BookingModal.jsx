import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const BookingModal = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Book a Demo</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Calendly Inline Embed */}
                <div className="flex-1 w-full bg-white">
                    <iframe
                        src="https://calendly.com/bitlanceai/task-regarding"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        title="Calendly Scheduling Page"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
