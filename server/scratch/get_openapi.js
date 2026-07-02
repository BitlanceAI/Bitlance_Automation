import dotenv from 'dotenv';
dotenv.config();

async function getOpenApi() {
    const res = await fetch(`${process.env.NEW_SUPABASE_URL}/rest/v1/`, {
        headers: {
            'apikey': process.env.NEW_SUPABASE_SERVICE_ROLE_KEY
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

getOpenApi();
