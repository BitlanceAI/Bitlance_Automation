import React, { useState } from 'react';
import { Send, Smartphone, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config.js';

const PushNotificationPanel = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        target: 'all',
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
            const payload = { ...formData, data: parsedData };
            await axios.post(`${API_BASE_URL}/api/push/send`, payload, {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-[#111111] rounded-[2px] p-6 border border-[#1E1E1E]">
                <h2 className="text-xl font-bold mb-6 text-white font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#26cece]" />
                    Compose Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-[2px] border border-[#333] bg-[#070707] text-white focus:outline-none focus:border-[#26cece] focus:ring-0 transition-all font-mono text-[14px]"
                            placeholder="Check out our new post!" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Body</label>
                        <textarea name="body" rows="3" value={formData.body} onChange={handleChange} required
                            className="w-full px-4 py-3 rounded-[2px] border border-[#333] bg-[#070707] text-white focus:outline-none focus:border-[#26cece] focus:ring-0 transition-all font-mono text-[14px] resize-none"
                            placeholder="We just published a guide on SEO..." />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Target Audience</label>
                            <select name="target" value={formData.target} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-[2px] border border-[#333] bg-[#070707] text-white focus:outline-none focus:border-[#26cece] focus:ring-0 transition-all font-mono text-[14px] appearance-none">
                                <option value="all">All Devices</option>
                                <option value="ios">iOS Only</option>
                                <option value="android">Android Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Image URL (Optional)</label>
                            <input type="url" name="image" value={formData.image} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-[2px] border border-[#333] bg-[#070707] text-white focus:outline-none focus:border-[#26cece] focus:ring-0 transition-all font-mono text-[14px]"
                                placeholder="https://..." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-2">Custom Data (JSON)</label>
                        <textarea name="data" rows="2" value={formData.data} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-[2px] border border-[#333] bg-[#070707] text-white focus:outline-none focus:border-[#26cece] focus:ring-0 transition-all font-mono text-[14px] resize-none" />
                    </div>
                    <div className="pt-4">
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#26cece] text-[#070707] font-bold py-4 px-4 rounded-[2px] transition-all font-['Space_Grotesk'] tracking-widest uppercase hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#333] disabled:opacity-50">
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Notification
                        </button>
                    </div>
                </form>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-6 text-white font-['Space_Grotesk'] uppercase tracking-tight flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#26cece]" />
                    Live Preview
                </h2>
                <div className="relative border-[#111] bg-[#070707] border-[14px] rounded-[30px] h-[600px] w-[300px] shadow-[4px_4px_0_0_#26cece]">
                    <div className="w-[120px] h-[24px] bg-[#111] top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-10"></div>
                    <div className="h-[32px] w-[3px] bg-[#111] absolute -start-[17px] top-[72px]"></div>
                    <div className="h-[46px] w-[3px] bg-[#111] absolute -start-[17px] top-[124px]"></div>
                    <div className="h-[46px] w-[3px] bg-[#111] absolute -start-[17px] top-[178px]"></div>
                    <div className="h-[64px] w-[3px] bg-[#111] absolute -end-[17px] top-[142px]"></div>
                    <div className="rounded-[16px] overflow-hidden w-full h-full bg-[#070707] relative border border-[#1E1E1E]">
                        <div className="h-6 w-full bg-transparent flex justify-between px-6 pt-2 text-[10px] font-mono text-white">
                            <span>9:41</span>
                            <div className="flex gap-1"><span>🔋</span></div>
                        </div>
                        <div className="mt-8 mx-2 bg-[#111111] border border-[#1E1E1E] rounded-[2px] p-4 shadow-[2px_2px_0_0_#26cece]">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-[2px] bg-[#26cece] flex items-center justify-center shrink-0 border border-[#333]">
                                    <span className="text-[#070707] font-bold font-['Space_Grotesk'] text-lg">B</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[12px] font-bold font-mono tracking-widest uppercase text-white truncate">Bitlance App</p>
                                        <span className="text-[10px] font-mono text-gray-500">Now</span>
                                    </div>
                                    <p className="text-[14px] font-bold text-white mt-1 font-['Space_Grotesk'] tracking-tight">{formData.title || 'Notification Title'}</p>
                                    <p className="text-[13px] text-gray-400 mt-1 font-sans line-clamp-2">{formData.body || 'Notification body text will appear here...'}</p>
                                </div>
                            </div>
                            {formData.image && (
                                <div className="mt-3 rounded-[2px] overflow-hidden h-32 w-full border border-[#1E1E1E]">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 w-full p-4 text-center">
                            <div className="w-1/3 h-1 bg-[#333] mx-auto rounded-[2px]"></div>
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-[10px] font-mono tracking-widest uppercase text-gray-500">Lock Screen Preview</p>
            </div>
        </div>
    );
};

export default PushNotificationPanel;
