import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, Info } from 'lucide-react';

const UploadCSVView = () => {
    return (
        <div className="flex-1 p-8 bg-transparent overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-[#26cece]" /> Upload CSV
                    </h2>
                    <p className="text-sm font-mono text-white/40 mt-1 uppercase tracking-widest">Bulk schedule multiple posts at once</p>
                </div>
                
                <div className="bg-white/5 border-2 border-white/10 rounded-[2px] p-12 text-center border-dashed hover:border-[#26cece] transition-colors cursor-pointer group shadow-[0_2px_16px_0_rgba(0,0,0,0.06)]">
                    <div className="w-16 h-16 bg-[#26cece]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-[#26cece]" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] uppercase tracking-tight mb-2">Drag &amp; Drop your CSV file here</h3>
                    <p className="text-sm text-white/40 font-mono tracking-widest uppercase mb-6">maximum file size 10MB</p>
                    <button className="bg-[#26cece] text-white px-8 py-3 rounded-[2px] font-bold font-['Space_Grotesk'] uppercase tracking-widest hover:bg-[#1fb8b8] hover:-translate-y-1 transition-all">
                        Browse Files
                    </button>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-[2px] p-6 flex flex-col sm:flex-row items-start gap-4">
                    <Info className="w-5 h-5 text-[#26cece] shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-white font-mono uppercase tracking-widest mb-2">CSV Format Requirements</h4>
                        <p className="text-[12px] font-sans text-white/50 leading-relaxed mb-4 max-w-2xl">
                            Ensure your CSV file contains the following columns with these exact headers to process correctly: <span className="text-[#26cece]">Date</span> (YYYY-MM-DD), <span className="text-[#26cece]">Time</span> (HH:MM), <span className="text-[#26cece]">Content</span>, and optionally <span className="text-[#26cece]">Media URL</span>.
                        </p>
                        <button className="text-[12px] font-mono tracking-widest uppercase flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-[#26cece] hover:text-[#26cece] text-white/50 rounded-[2px] transition-colors shrink-0">
                            <Download className="w-4 h-4" /> Download Sample Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadCSVView;
