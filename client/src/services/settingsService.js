import API_BASE_URL from '../config.js';
import { supabase } from './supabaseClient.js';

const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/**
 * Save or update user's Google Sheets settings
 */
export async function saveUserSettings(userId, { googleSheetId, googleServiceEmail, googlePrivateKey }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, googleSheetId, googleServiceEmail, googlePrivateKey })
    });
    return response.json();
}

/**
 * Save or update user's WordPress credentials
 */
export async function saveWordPressSettings(userId, { wpUrl, wpUsername, wpAppPassword }) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, wpUrl, wpUsername, wpAppPassword })
    });
    return response.json();
}

/**
 * Get all user settings (Google Sheets + WordPress)
 */
export async function getUserSettings(userId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/settings/${userId}`, {
        headers,
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Delete all user settings
 */
export async function deleteUserSettings(userId) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/user/settings/${userId}`, {
        method: 'DELETE',
        headers,
    });
    return response.json();
}

export default {
    saveUserSettings,
    saveWordPressSettings,
    getUserSettings,
    deleteUserSettings
};
