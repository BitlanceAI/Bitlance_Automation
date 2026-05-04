// Service for managing meetings via API

const API_BASE_URL = '';

export const meetingsService = {
    /**
     * Fetch all meetings with optional filters
     * @param {Object} filters - Optional filters (start_date, end_date, status)
     * @returns {Promise<Array>} Array of meetings
     */
    async fetchMeetings(filters = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (filters.start_date) queryParams.append('start_date', filters.start_date);
            if (filters.end_date) queryParams.append('end_date', filters.end_date);
            if (filters.status) queryParams.append('status', filters.status);

            const url = `${API_BASE_URL}/api/meetings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch meetings');

            return await response.json();
        } catch (error) {
            console.error('Error fetching meetings:', error);
            throw error;
        }
    },

    /**
     * Fetch a specific meeting by ID
     * @param {string} id - Meeting ID
     * @returns {Promise<Object>} Meeting object
     */
    async fetchMeetingById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meetings/${id}`);
            if (!response.ok) throw new Error('Failed to fetch meeting');

            return await response.json();
        } catch (error) {
            console.error('Error fetching meeting:', error);
            throw error;
        }
    },

    /**
     * Update a meeting
     * @param {string} id - Meeting ID
     * @param {Object} data - Updated meeting data
     * @returns {Promise<Object>} Updated meeting object
     */
    async updateMeeting(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to update meeting');

            return await response.json();
        } catch (error) {
            console.error('Error updating meeting:', error);
            throw error;
        }
    },

    /**
     * Delete a meeting
     * @param {string} id - Meeting ID
     * @returns {Promise<Object>} Success response
     */
    async deleteMeeting(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/meetings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete meeting');

            return await response.json();
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    },

    /**
     * Manually analyze a transcript for meetings
     * @param {string} callId - Call ID to analyze
     * @returns {Promise<Object>} Analysis result
     */
    async analyzeTranscript(callId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/analyze-transcript`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ call_id: callId }),
            });

            if (!response.ok) throw new Error('Failed to analyze transcript');

            return await response.json();
        } catch (error) {
            console.error('Error analyzing transcript:', error);
            throw error;
        }
    },
};
