import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bunny.net Storage Service
 * Ensure these variables are set in your .env file:
 * BUNNY_STORAGE_ZONE=your_zone_name
 * BUNNY_API_KEY=your_storage_zone_password
 * BUNNY_PULL_ZONE_URL=https://your-pull-zone.b-cdn.net
 * BUNNY_REGION= (optional, e.g., 'ny.', 'la.', 'sg.', leaving blank uses default global endpoint)
 */

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const API_KEY = process.env.BUNNY_API_KEY;
const PULL_ZONE = process.env.BUNNY_PULL_ZONE_URL; // e.g. https://bitlance.b-cdn.net
const REGION = process.env.BUNNY_REGION ? process.env.BUNNY_REGION.toLowerCase() : ''; // if you use NY storage, set to 'ny' or 'ny.'
const REGION_PREFIX = REGION ? (REGION.endsWith('.') ? REGION : `${REGION}.`) : '';

const BASE_URL = `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}`;

/**
 * Uploads a buffer to Bunny.net storage.
 * 
 * @param {Buffer} buffer The file buffer
 * @param {string} filename The full path/filename to save as (e.g. 'campaigns/image.jpg')
 * @param {string} contentType The mime type (e.g. 'image/jpeg')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadBuffer = async (buffer, filename, contentType) => {
    if (!API_KEY || !STORAGE_ZONE || !PULL_ZONE) {
        throw new Error('Bunny.net configuration is missing in .env');
    }

    // Ensure path doesn't start with a slash for the URL construction
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    const url = `${BASE_URL}/${cleanFilename}`;

    try {
        const response = await axios.put(url, buffer, {
            headers: {
                'AccessKey': API_KEY,
                'Content-Type': contentType || 'application/octet-stream',
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        if (response.status === 201 || response.status === 200) {
            // Remove trailing slash from pull zone if present
            const cleanPullZone = PULL_ZONE.endsWith('/') ? PULL_ZONE.slice(0, -1) : PULL_ZONE;
            return `${cleanPullZone}/${cleanFilename}`;
        } else {
            throw new Error(`Failed to upload to Bunny.net. Status: ${response.status}`);
        }
    } catch (error) {
        console.error('[Bunny Storage] Upload error:', error.response?.data || error.message);
        throw new Error(`Bunny Storage upload failed: ${error.message}`);
    }
};

/**
 * Uploads a base64 string to Bunny.net storage.
 * 
 * @param {string} base64String The data URI (e.g. data:image/png;base64,iVBORw0K...)
 * @param {string} directory The folder to put it in (e.g. 'broadcasts')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadBase64 = async (base64String, directory = 'uploads') => {
    const match = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!match || match.length !== 3) {
        throw new Error('Invalid base64 media format provided');
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const extension = mimeType.split('/')[1] || 'bin';
    // Generate unique filename
    const filename = `${directory}/${Date.now()}_${uuidv4().substring(0,8)}.${extension}`;

    return await uploadBuffer(buffer, filename, mimeType);
};
