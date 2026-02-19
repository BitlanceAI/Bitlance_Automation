import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Send, Smartphone, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PushNotificationPage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'all', // all, ios, android
        image: '',
        data: '{}'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let parsedData = {};
            try {
                parsedData = JSON.parse(formData.data);
            } catch (err) {
                toast.error('Invalid JSON in Data field');
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                data: parsedData
            };

            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/push/send`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Notification sent successfully!');
            setFormData({ title: '', body: '', target: 'all', image: '', data: '{}' });
        } catch (error) {
            console.error(error);
            toast.error('Failed to send notification: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-12">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Push Notifications</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Send alerts to your mobile app users</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-indigo-600" />
                            Compose Message
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Check out our new post!"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
                                <textarea
                                    name="body"
                                    rows="3"
                                    value={formData.body}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    placeholder="We just published a guide on SEO..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                                    <select
                                        name="target"
                                        value={formData.target}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Devices</option>
                                        <option value="ios">iOS Only</option>
                                        <option value="android">Android Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Data (JSON)</label>
                                <textarea
                                    name="data"
                                    rows="2"
                                    value={formData.data}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    Send Notification
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Preview */}
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-indigo-600" />
                            Live Preview
                        </h2>

                        <div className="relative border-gray-800 dark:border-slate-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
                            <div className="w-[148px] h-[18px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-10"></div>
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

                            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-900 relative">
                                {/* Status Bar Mock */}
                                <div className="h-6 w-full bg-transparent flex justify-between px-6 pt-2 text-[10px] font-bold text-gray-900 dark:text-white">
                                    <span>9:41</span>
                                    <div className="flex gap-1">
                                        <span>Items</span>
                                    </div>
                                </div>

                                {/* Notification Banner */}
                                <div className="mt-8 mx-2 bg-gray-200/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-gray-300/50 dark:border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                                            <span className="text-white font-bold text-lg">A</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">App Name</p>
                                                <span className="text-[10px] text-gray-500">Now</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{formData.title || 'Notification Title'}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">{formData.body || 'Notification body text will appear here...'}</p>
                                        </div>
                                    </div>
                                    {formData.image && (
                                        <div className="mt-2 rounded-lg overflow-hidden h-32 w-full">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Wallpaper / App Content */}
                                <div className="absolute bottom-0 w-full p-4 text-center">
                                    <div className="w-1/3 h-1 bg-gray-300 dark:bg-gray-600 mx-auto rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-500">iOS Lock Screen Preview</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushNotificationPage;
