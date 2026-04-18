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
            onClick={(e) => {
                if (status === 'Coming Soon') {
                    e.preventDefault();
                    return;
                }
                onClick && onClick(e);
            }}
            className={`
        group relative rounded-[2px] 
        transition-all duration-300 ease-in-out
        p-5 flex flex-col h-full
        border
        ${status === 'Coming Soon' 
            ? 'bg-[#0a0a0a] border-[#161616] opacity-70 cursor-not-allowed' 
            : 'bg-[#111111] border-[#1E1E1E] hover:border-[#333] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#26CECE] cursor-pointer'
        }
      `}
        >
            {/* Status Badge - Top Right */}
            <div className={`absolute top-4 right-4 scale-90 origin-top-right ${status === 'Coming Soon' ? 'opacity-80' : ''}`}>
                <StatusBadge status={status} />
            </div>

            {/* Icon */}
            <div className="mb-3">
                <div className={`
                  w-10 h-10 rounded-[2px] bg-[#070707] border border-[#333]
                  flex items-center justify-center text-[#26CECE]
                  transition-colors duration-300
                  ${status !== 'Coming Soon' ? 'group-hover:bg-[#26CECE] group-hover:text-[#070707]' : 'text-gray-500 border-[#222]'}
                `}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>

            {/* Title */}
            <h3 className={`text-[15px] font-bold mb-2 leading-tight font-['Space_Grotesk'] tracking-widest uppercase ${status === 'Coming Soon' ? 'text-gray-400' : 'text-white'}`}>
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-400 text-[11px] font-mono leading-relaxed mb-4 flex-grow tracking-wide">
                {description}
            </p>

            {/* Features List */}
            <div className={`space-y-2 pt-3 border-t ${status === 'Coming Soon' ? 'border-[#161616]' : 'border-[#1E1E1E]'}`}>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`flex items-start gap-2 text-[10px] font-mono tracking-widest uppercase ${status === 'Coming Soon' ? 'text-gray-600' : 'text-gray-500'}`}
                    >
                        <CheckCircle2 className={`w-3 h-3 flex-shrink-0 mt-[1px] ${status === 'Coming Soon' ? 'text-gray-600' : 'text-[#26CECE]'}`} />
                        <span className="leading-snug">{feature}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentCard;
