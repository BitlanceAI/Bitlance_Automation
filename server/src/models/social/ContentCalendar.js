import mongoose from 'mongoose';

const festivalSchema = new mongoose.Schema({
    day:   Number,
    event: String,
}, { _id: false });

const contentCalendarSchema = new mongoose.Schema({
    userId:      { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    month:       { type: String, required: true },
    year:        { type: String, required: true },
    themes:      [String],
    festivals:   [festivalSchema],
}, { timestamps: true });

export default mongoose.model('ContentCalendar', contentCalendarSchema);
