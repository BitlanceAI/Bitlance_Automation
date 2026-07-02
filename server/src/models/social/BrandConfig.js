import mongoose from 'mongoose';

const brandConfigSchema = new mongoose.Schema({
    userId:             { type: String, required: true, index: true },
    workspaceId:        { type: String, required: true, index: true },
    brand_name:         { type: String, required: true },
    brand_tone:         { type: String, default: '' },
    brand_niche:        { type: String, default: '' },
    website_url:        { type: String, default: null },
    language:           { type: String, default: 'English' },
    bloom_brand_id:     { type: String, default: null },   // Bloom brand session UUID
    bloom_brand_status: { type: String, default: null },   // 'analyzing' | 'ready' | 'failed'
}, { timestamps: true });

export default mongoose.model('BrandConfig', brandConfigSchema);
