
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join('d:', 'automation-bitlance', 'server', '.env');
const envConfig = dotenv.config({ path: envPath }).parsed;

if (!envConfig) {
    console.log('Could not load .env file');
    process.exit(1);
}

const keysToCheck = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'META_APP_ID', 'META_APP_SECRET', 'ENCRYPTION_KEY'];
const results = {};

keysToCheck.forEach(key => {
    const value = envConfig[key];
    results[key] = {
        exists: !!value,
        length: value ? value.length : 0,
        isValidHex: key === 'ENCRYPTION_KEY' && value ? /^[0-9a-fA-F]+$/.test(value) : undefined
    };
});

console.log(JSON.stringify(results, null, 2));
