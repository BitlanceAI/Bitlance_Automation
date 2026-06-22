import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/layout/SEOHead';
import { ArrowRight } from 'lucide-react';

const TEAL = '#26CECE';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white px-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <SEOHead 
                title="404 - Page Not Found"
                description="The page you are looking for does not exist or has been moved."
                noIndex={true}
            />
            
            <div className="text-center max-w-md">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4" style={{ fontFamily: "'DM Mono', monospace" }}>
                    [ ERROR_CODE_404 ]
                </span>
                
                <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase mb-6">
                    VOID_
                </h1>
                
                <p className="text-lg text-gray-600 mb-10 font-medium leading-relaxed">
                    The requested coordinates do not map to any active node in the Bitlance directory. The page may have been relocated or purged.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ fontFamily: "'DM Mono', monospace" }}>
                    <Link 
                        to="/" 
                        className="px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:bg-black hover:text-white flex items-center justify-center gap-2"
                        style={{ background: '#f9fafb', color: '#000000', border: '1px solid #e5e7eb' }}
                    >
                        Return Home
                    </Link>
                    <Link 
                        to="/blogs" 
                        className="px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all hover:bg-black hover:text-white flex items-center justify-center gap-2"
                        style={{ background: TEAL, color: '#000000' }}
                    >
                        Read Blogs <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
