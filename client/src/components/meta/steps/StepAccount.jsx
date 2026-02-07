import React from 'react';
import { Users } from 'lucide-react';

/**
 * Step 1: Account Selection
 * Select the Facebook Page to post to
 */
const StepAccount = ({ pages, selectedPageId, onSelect }) => {
    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" /> Select Page
            </h4>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Page
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {pages?.map(page => (
                        <div
                            key={page.id}
                            onClick={() => onSelect(page.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPageId === page.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                                }`}
                        >
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                                {page.name}
                            </h5>
                            <p className="text-sm text-gray-500">{page.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepAccount;
