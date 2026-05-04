import React from 'react';

const CTA_OPTIONS = [
    { value: 'LEARN_MORE', label: 'Learn More' },
    { value: 'SHOP_NOW', label: 'Shop Now' },
    { value: 'SIGN_UP', label: 'Sign Up' },
    { value: 'CONTACT_US', label: 'Contact Us' },
    { value: 'DOWNLOAD', label: 'Download' },
    { value: 'BOOK_NOW', label: 'Book Now' },
    { value: 'GET_OFFER', label: 'Get Offer' },
];

const StepContent = ({ formData, updateFormData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('creative.')) {
            const field = name.split('.')[1];
            updateFormData('creative', { [field]: value });
        } else {
            updateFormData(null, { [name]: value });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-2">Campaign Content</h2>
            <p className="text-gray-500 mb-6">Define your ad creative and destination.</p>

            {/* Campaign Name */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Summer Sale 2026"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Headline */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Headline</label>
                <input
                    type="text"
                    name="creative.headline"
                    value={formData.creative.headline}
                    onChange={handleChange}
                    placeholder="Catchy headline for your ad"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Primary Text */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Primary Text</label>
                <textarea
                    name="creative.text"
                    value={formData.creative.text}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Main ad copy..."
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
            </div>

            {/* Destination URL */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Destination URL</label>
                <input
                    type="url"
                    name="creative.destination_url"
                    value={formData.creative.destination_url}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com/landing"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Image URL */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Image URL</label>
                <input
                    type="url"
                    name="creative.image_url"
                    value={formData.creative.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {formData.creative.image_url && (
                    <img src={formData.creative.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded-lg" />
                )}
            </div>

            {/* CTA */}
            <div>
                <label className="block font-medium text-gray-700 mb-1">Call to Action</label>
                <select
                    name="creative.cta_type"
                    value={formData.creative.cta_type}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                    {CTA_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default StepContent;
