import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, Link } from 'react-router-dom';

const ClientHistoryPage = () => {
    const { id } = useParams();
    const [history, setHistory] = useState([]);
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
        fetchClientDetails();
    }, [id]);

    const fetchClientDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setClient(data);
        } catch (error) {
            console.error('Error fetching client:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('client_history')
                .select('*')
                .eq('client_id', id)
                .order('performed_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-10">Loading history...</div>;
    if (!client) return <div className="text-center p-10">Client not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/admin" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">&larr; Back to Clients</Link>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{client.name} - History</h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {client.company} • {client.email}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${client.status === 'Active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {client.status}
                        </span>
                    </div>
                </div>

                {/* Timeline / List */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Activity Log</h2>

                    <div className="flow-root">
                        <ul className="-mb-8">
                            {history.map((event, eventIdx) => (
                                <li key={event.id}>
                                    <div className="relative pb-8">
                                        {eventIdx !== history.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-slate-800 ${event.action_type === 'create' ? 'bg-green-500' :
                                                        event.action_type === 'view' ? 'bg-blue-500' :
                                                            'bg-gray-500'
                                                    }`}>
                                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        <span className="font-medium text-gray-900 dark:text-white mr-2">
                                                            {event.feature_name}
                                                        </span>
                                                        {event.action_type}
                                                    </p>
                                                    {event.details && (
                                                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-2 rounded">
                                                            {typeof event.details === 'string' ? event.details : JSON.stringify(event.details, null, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                    <time dateTime={event.performed_at}>
                                                        {new Date(event.performed_at).toLocaleString()}
                                                    </time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {history.length === 0 && (
                            <div className="text-center py-4 text-gray-500">No history events found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientHistoryPage;
