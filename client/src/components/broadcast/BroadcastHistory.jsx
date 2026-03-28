import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from "../../context/AuthContext";

const BroadcastHistory = () => {
    const { session } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchHistory();
        }
    }, [session]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = session?.access_token;
            if (!token) return;

            const response = await axios.get('/api/whatsapp/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle className="w-4 h-4 text-[#26cece]" />;
            case 'FAILED':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'SENDING':
            case 'QUEUED':
                return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    if (loading) return <div className="text-center py-10 font-mono text-[#26cece] text-[10px] uppercase tracking-widest flex justify-center items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> FETCHING HISTORY...</div>;

    if (history.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333]">
                <Clock className="w-12 h-12 text-gray-300 dark:text-[#333] mx-auto mb-4" />
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest max-w-sm mx-auto">&gt; NO BROADCAST HISTORY FOUND. SYSTEM AWAITING FIRST TRANSMISSION.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#333] shadow-[4px_4px_0_0_#26cece] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#333]">
                    <thead className="bg-gray-50 dark:bg-[#070707] border-b border-gray-200 dark:border-[#333]">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-[#26cece] uppercase tracking-widest">Broadcast Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-[#26cece] uppercase tracking-widest">Template Matrix</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-[#26cece] uppercase tracking-widest">Recipients</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-[#26cece] uppercase tracking-widest">Status Vector</th>
                            <th className="px-6 py-4 text-left text-[10px] font-mono font-bold text-[#26cece] uppercase tracking-widest">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#333] bg-white dark:bg-[#111111]">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#070707] hover:bg-opacity-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold font-mono text-gray-900 dark:text-white group-hover:text-[#26cece] transition-colors">{item.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-[10px] font-mono tracking-widest text-[#26cece] uppercase border border-gray-200 dark:border-[#333] inline-block px-2 py-1 bg-[#26cece]/10">{item.whatsapp_templates?.name || 'DIRECT_MESSAGE'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-mono text-gray-900 dark:text-white mb-1">{item.total_recipients} TARGETS</div>
                                    <div className="text-[10px] font-mono tracking-widest uppercase flex gap-3">
                                        {item.successful_sends > 0 && <span className="text-[#26cece] flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {item.successful_sends} SUCCESS</span>}
                                        {item.failed_sends > 0 && <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {item.failed_sends} FAILED</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.status)}
                                        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase border px-2 py-1 ${
                                            item.status === 'COMPLETED' ? 'text-[#26cece] border-[#26cece] bg-[#26cece]/10' :
                                            item.status === 'FAILED' ? 'text-red-500 border-red-500 bg-red-500/10' :
                                            'text-blue-500 border-blue-500 bg-blue-500/10'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-[10px] font-mono uppercase tracking-widest text-gray-500">
                                    <div className="text-gray-600 dark:text-gray-300">{new Date(item.created_at).toLocaleDateString()}</div>
                                    <div className="mt-1">&gt; {new Date(item.created_at).toLocaleTimeString()}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BroadcastHistory;
