let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://bitlance-app-97qhp.ondigitalocean.app' : 'http://localhost:3001');

export default API_BASE_URL;
