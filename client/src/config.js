let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// If in production and API_BASE_URL is pointing to localhost, override it to use relative path
if (import.meta.env.PROD && (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1'))) {
    API_BASE_URL = '';
}

export default API_BASE_URL;
