import React from 'react';

const StepBudgetSchedule = ({ formData, updateFormData }) => {
    const handleBudgetChange = (e) => {
        updateFormData('budget', { [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleScheduleChange = (e) => {
        updateFormData('schedule', { [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-2">Budget & Schedule</h2>
            <p className="text-gray-500 mb-6">Set your daily budget and campaign duration.</p>

            {/* Daily Budget */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Daily Budget (USD)</label>
                <div className="flex items-center">
                    <span className="bg-gray-100 px-4 py-3 rounded-l-lg border border-r-0 text-gray-500">$</span>
                    <input
                        type="number"
                        name="daily_amount"
                        value={formData.budget.daily_amount}
                        onChange={handleBudgetChange}
                        min={1}
                        step={1}
                        className="flex-1 border rounded-r-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <p className="text-sm text-gray-400 mt-1">Minimum $1/day. Meta recommends at least $5/day for best results.</p>
            </div>

            {/* Start Date */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.schedule.start_time}
                    onChange={handleScheduleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* End Date */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">End Date & Time</label>
                <input
                    type="datetime-local"
                    name="end_time"
                    value={formData.schedule.end_time}
                    onChange={handleScheduleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-sm text-gray-400 mt-1">Leave blank to run indefinitely.</p>
            </div>

            {/* Estimated Spend */}
            {formData.schedule.start_time && formData.schedule.end_time && (
                <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-blue-800 font-medium">Estimated Total Spend</p>
                    <p className="text-2xl font-bold text-blue-600">
                        ${(
                            formData.budget.daily_amount *
                            Math.ceil(
                                (new Date(formData.schedule.end_time) - new Date(formData.schedule.start_time)) /
                                (1000 * 60 * 60 * 24)
                            )
                        ).toFixed(2)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default StepBudgetSchedule;
