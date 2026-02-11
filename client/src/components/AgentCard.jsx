import React from 'react';
import StatusBadge from './StatusBadge';
import { CheckCircle2 } from 'lucide-react';

const AgentCard = ({
    icon: Icon,
    title,
    description,
    features,
    status,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className="
        group relative bg-white dark:bg-slate-800 rounded-2xl shadow-md 
        hover:shadow-2xl hover:-translate-y-1 
        transition-all duration-300 ease-in-out
        p-8 flex flex-col h-full cursor-pointer
        border border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600
      "
        >
            {/* Status Badge - Top Right */}
            <div className="absolute top-6 right-6">
                <StatusBadge status={status} />
            </div>

            {/* Icon */}
            <div className="mb-6">
                <div className="
          w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20
          flex items-center justify-center text-4xl text-indigo-600 dark:text-indigo-400
          group-hover:scale-110 transition-transform duration-300
        ">
                    <Icon className="w-8 h-8" />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 flex-grow">
                {description}
            </p>

            {/* Features List */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                    </div>
                ))}
            </div>

            {/* Hover Indicator */}
            <div className="
        absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
        from-indigo-600 to-purple-600 rounded-b-2xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      "></div>
        </div>
    );
};

export default AgentCard;
