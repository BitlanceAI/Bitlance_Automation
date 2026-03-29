import API_BASE_URL from '../config.js';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

/**
 * Save or update user's Google Sheets settings
 */
export async function saveUserSettings(userId, { googleSheetId, googleServiceEmail, googlePrivateKey }) {
    const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, googleSheetId, googleServiceEmail, googlePrivateKey })
    });
    return response.json();
}

/**
 * Save or update user's WordPress credentials
 */
export async function saveWordPressSettings(userId, { wpUrl, wpUsername, wpAppPassword }) {
    const response = await fetch(`${API_BASE_URL}/api/user/settings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, wpUrl, wpUsername, wpAppPassword })
    });
    return response.json();
}

/**
 * Get all user settings (Google Sheets + WordPress)
 */
export async function getUserSettings(userId) {
    const response = await fetch(`${API_BASE_URL}/api/user/settings/${userId}`, {
        headers: getAuthHeaders(),
    });
    return response.json();
}

/**
 * Delete all user settings
 */
export async function deleteUserSettings(userId) {
    const response = await fetch(`${API_BASE_URL}/api/user/settings/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return response.json();
}

export default {
    saveUserSettings,
    saveWordPressSettings,
    getUserSettings,
    deleteUserSettings
};
