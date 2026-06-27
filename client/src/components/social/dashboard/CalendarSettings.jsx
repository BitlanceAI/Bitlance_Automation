import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Save, Tag } from 'lucide-react';

const CalendarSettings = ({ onSave, initialData }) => {
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [themes, setThemes] = useState('');
    const [festivals, setFestivals] = useState([{ date: '', name: '' }]);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (initialData) {
            if (initialData.month) setMonth(initialData.month);
            if (initialData.year) setYear(initialData.year);
            if (initialData.themes) setThemes(initialData.themes.join(', '));
            if (initialData.festivals && initialData.festivals.length > 0) {
                setFestivals(initialData.festivals);
            }
        }
    }, [initialData]);

    const handleAddFestival = () => {
        setFestivals([...festivals, { date: '', name: '' }]);
    };

    const handleRemoveFestival = (index) => {
        const newFestivals = [...festivals];
        newFestivals.splice(index, 1);
        setFestivals(newFestivals);
    };

    const handleFestivalChange = (index, field, value) => {
        const newFestivals = [...festivals];
        newFestivals[index][field] = value;
        setFestivals(newFestivals);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const data = {
                month,
                year,
                themes: themes.split(',').map(t => t.trim()).filter(Boolean),
                festivals: festivals.filter(f => f.date && f.name)
            };
            if (onSave) {
                await onSave(data);
            } else {
                console.log('Calendar Settings:', data);
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white uppercase tracking-wider mb-2">30-Day Calendar Config</h2>
                <p className="text-teal-50/70 text-sm font-mono">Define monthly themes and key dates for the AI Content Planner.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-mono text-white/80 mb-2">Target Month</label>
                        <select 
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#26cece] transition-all font-mono text-sm"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/80 mb-2">Year</label>
                        <input 
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#26cece] transition-all font-mono text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="flex items-center text-sm font-mono text-white/80 mb-2">
                        <Tag className="w-4 h-4 mr-2 text-[#26cece]" />
                        Monthly Themes (comma separated)
                    </label>
                    <input
                        type="text"
                        value={themes}
                        onChange={(e) => setThemes(e.target.value)}
                        placeholder="e.g. Summer Sale, Back to School, Product Launch"
                        className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] transition-all font-mono text-sm"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-sm font-mono text-white/80">
                            <CalendarIcon className="w-4 h-4 mr-2 text-[#26cece]" />
                            Key Dates & Festivals
                        </label>
                        <button 
                            type="button"
                            onClick={handleAddFestival}
                            className="text-[#26cece] hover:text-white text-xs font-mono flex items-center transition-colors"
                        >
                            <Plus className="w-3 h-3 mr-1" /> Add Date
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {festivals.map((festival, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="Day (1-31)"
                                    value={festival.date}
                                    onChange={(e) => handleFestivalChange(index, 'date', e.target.value)}
                                    className="w-24 bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Event Name (e.g. Independence Day)"
                                    value={festival.name}
                                    onChange={(e) => handleFestivalChange(index, 'name', e.target.value)}
                                    className="flex-1 bg-[#111] border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#26cece] text-sm"
                                />
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveFestival(index)}
                                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {festivals.length === 0 && (
                            <p className="text-white/30 text-xs font-mono italic">No key dates added yet.</p>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center justify-center w-full px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold font-mono text-sm uppercase tracking-wider rounded-xl transition-all"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Calendar Info
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CalendarSettings;
