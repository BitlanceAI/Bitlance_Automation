import React from 'react';

const StatusBadge = ({ status }) => {
    const statusConfig = {
        Available: {
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            borderColor: 'border-green-300',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )
        },
        'Coming Soon': {
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            borderColor: 'border-yellow-300',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            )
        },
        Beta: {
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-300',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            )
        },
        Disabled: {
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-500',
            borderColor: 'border-gray-300',
            icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
            )
        }
    };

    const config = statusConfig[status] || statusConfig.Disabled;

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
        text-xs font-medium border transition-all
        ${config.bgColor} ${config.textColor} ${config.borderColor}
      `}
        >
            {config.icon}
            {status}
        </span>
    );
};

export default StatusBadge;
