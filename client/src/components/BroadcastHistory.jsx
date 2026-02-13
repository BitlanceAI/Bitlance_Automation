import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';

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
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'FAILED':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'SENDING':
            case 'QUEUED':
                return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    if (loading) return <div className="text-center py-10">Loading history...</div>;

    if (history.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No broadcast history found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Broadcast Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.whatsapp_templates?.name || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{item.total_recipients}</div>
                                    <div className="text-xs text-gray-500">
                                        {item.successful_sends > 0 && <span className="text-green-600">{item.successful_sends} sent</span>}
                                        {item.failed_sends > 0 && <span className="text-red-500 ml-2">{item.failed_sends} failed</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(item.status)}
                                        <span className={`text-sm font-medium ${item.status === 'COMPLETED' ? 'text-green-600' :
                                            item.status === 'FAILED' ? 'text-red-600' :
                                                'text-blue-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(item.created_at).toLocaleDateString()}
                                    <div className="text-xs">{new Date(item.created_at).toLocaleTimeString()}</div>
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
