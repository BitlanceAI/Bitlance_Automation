import React from 'react';
import StatusBadge from '../dashboard/StatusBadge';
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
        group relative bg-[#111111] rounded-[2px] 
        hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#26CECE]
        transition-all duration-300 ease-in-out
        p-5 flex flex-col h-full cursor-pointer
        border border-[#1E1E1E] hover:border-[#333]
      "
        >
            {/* Status Badge - Top Right */}
            <div className="absolute top-4 right-4 scale-90 origin-top-right">
                <StatusBadge status={status} />
            </div>

            {/* Icon */}
            <div className="mb-3">
                <div className="
                  w-10 h-10 rounded-[2px] bg-[#070707] border border-[#333]
                  flex items-center justify-center text-[#26CECE]
                  group-hover:bg-[#26CECE] group-hover:text-[#070707] transition-colors duration-300
                ">
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-bold text-white mb-2 leading-tight font-['Space_Grotesk'] tracking-widest uppercase">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-[11px] font-mono leading-relaxed mb-4 flex-grow tracking-wide">
                {description}
            </p>

            {/* Features List */}
            <div className="space-y-2 pt-3 border-t border-[#1E1E1E]">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="flex items-start gap-2 text-[10px] text-gray-500 font-mono tracking-widest uppercase"
                    >
                        <CheckCircle2 className="w-3 h-3 text-[#26CECE] flex-shrink-0 mt-[1px]" />
                        <span className="leading-snug">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentCard;
