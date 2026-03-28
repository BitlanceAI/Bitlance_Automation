import React from 'react';
import { Users } from 'lucide-react';

/**
 * Step 1: Account Selection
 * Select the Facebook Page to post to
 */
const StepAccount = ({ pages, selectedPageId, onSelect }) => {
    return (
        <div className="space-y-6 font-mono">
            <h4 className="text-xl font-extrabold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-3 border-l-4 border-[#26cece] pl-3 mb-6">
                <Users className="h-5 w-5 text-[#26cece]" /> Select Terminal Node
            </h4>
            <div>
                <label className="block text-[10px] font-mono tracking-widest text-[#26cece] uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#26cece]"></span>
                    Authorized Pages
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {pages?.map(page => (
                        <div
                            key={page.id}
                            onClick={() => onSelect(page.id)}
                            className={`p-5 border cursor-pointer transition-all flex flex-col gap-2 rounded-none group ${selectedPageId === page.id
                                    ? 'border-[#26cece] bg-[#26cece]/10 shadow-[4px_4px_0_0_#26cece] -translate-y-1'
                                    : 'border-[#333] bg-[#111111] hover:border-[#26cece] hover:bg-[#070707]'
                                }`}
                        >
                            <h5 className="font-bold font-['Space_Grotesk'] text-white text-lg tracking-tight uppercase group-hover:text-[#26cece] transition-colors">
                                {page.name}
                            </h5>
                            <p className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">{page.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepAccount;
