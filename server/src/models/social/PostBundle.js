import mongoose from 'mongoose';

const postBundleSchema = new mongoose.Schema({
    userId:             { type: String, required: true, index: true },
    workspaceId:        { type: String, required: true, index: true },
    brandConfigId:      { type: mongoose.Schema.Types.ObjectId, ref: 'BrandConfig' },
    calendarId:         { type: mongoose.Schema.Types.ObjectId, ref: 'ContentCalendar' },
    generated_caption:  { type: String, default: '' },
    generated_hashtags: [String],
    strategy_used:      { type: mongoose.Schema.Types.Mixed, default: {} },
    graphic_url:        { type: String, default: null },
    scheduled_for:      { type: Date },
    day_offset:         { type: Number, default: 0 },
    platforms:          [{ type: String, enum: ['facebook', 'instagram', 'twitter', 'linkedin'] }],
    status: {
        type: String,
        enum: ['pending_review', 'approved', 'rejected', 'published'],
        default: 'pending_review',
    },
}, { timestamps: true });

export default mongoose.model('PostBundle', postBundleSchema);
