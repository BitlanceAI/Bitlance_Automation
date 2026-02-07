import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';

const TrafficCard = ({ campaign, onClick }) => {
    const { creative_assets: creative, destination_url } = campaign;

    return (
        <div
            onClick={() => onClick(destination_url)}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-700"
        >
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={creative.imageUrl || 'https://via.placeholder.com/400x200'}
                    alt={creative.headline}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                {creative.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 rounded-full shadow-sm">
                        {creative.badge}
                    </span>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {creative.headline}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                    {creative.description}
                </p>

                {/* Footer / CTA */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {creative.source || 'Sponsored'}
                    </span>

                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                        Read More <ArrowRight size={16} />
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TrafficCard;
