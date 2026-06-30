import mongoose from 'mongoose';

const scheduledPostSchema = new mongoose.Schema({
    userId:             { type: String, required: true, index: true },
    workspaceId:        { type: String, required: true, index: true },
    text:               { type: String, required: true },
    platforms:          [String],
    profile_ids:        [String],
    scheduled_at:       { type: Date, required: true },
    timezone:           { type: String, default: 'UTC' },
    media_url:          { type: String, default: null },
    media_category:     { type: String, default: null },
    approver_phone:     { type: String, default: null },
    whatsapp_message_id:{ type: String, default: null },
    agenda_job_id:      { type: String, default: null },
    status: {
        type: String,
        enum: ['pending_approval', 'approved', 'published', 'cancelled', 'failed'],
        default: 'pending_approval',
    },
    failReason:      { type: String, default: null },
    publishResults:  { type: mongoose.Schema.Types.Mixed, default: [] },
    publishErrors:   { type: mongoose.Schema.Types.Mixed, default: [] },
}, { timestamps: true });

export default mongoose.model('ScheduledPost', scheduledPostSchema);
