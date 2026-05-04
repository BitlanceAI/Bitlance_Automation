import { createClient } from '@supabase/supabase-js';
import { encryptData } from '../src/utils/encryption.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateCredentials() {
    const token = "EAALUSUBLPyowBQ4aBQJV8hc6jtaCOmXxKoexAYPFgewnZC8C3cgb7ymznkLqE5JsBHYigtdZAweyEdw412faNdIueSfTbSavMNBKrr3cuUQULPLFPA4yDoyrsOeu1BL129eDxwa8GZAH9LEEgFitxfR36fGD5zYuk9MIZAm2BuBp7HCQWav4jfIYtJobL7rtytJsfdA4vGpBLJc8Gq0rARmTas4JSF183M03msA3zdFhk4R3q@cdulxLL24Pgt5n2xQVFX0am42C1wwNy1ybFc8GH2kkeb@Q5dbSSPzgZDZD";
    const phoneId = "744188362103788";

    console.log("Encrypting token...");
    const encryptedToken = encryptData(token);

    console.log("Fetching active Meta connections...");
    const { data: connections, error: fetchErr } = await supabase
        .from('meta_connections')
        .select('*')
        .eq('is_active', true);

    if (fetchErr) {
        console.error("Error fetching connections:", fetchErr);
        return;
    }

    if (!connections || connections.length === 0) {
        console.log("No active meta connections found to update!");
        return;
    }

    console.log(`Found ${connections.length} active connection(s). Updating...`);
    for (const conn of connections) {
        const { error: updateErr } = await supabase
            .from('meta_connections')
            .update({
                access_token: encryptedToken,
                whatsapp_phone_id: phoneId,
                updated_at: new Date().toISOString()
            })
            .eq('id', conn.id);

        if (updateErr) {
            console.error(`Failed to update connection ${conn.id}:`, updateErr);
        } else {
            console.log(`Successfully updated WhatsApp credentials for user ${conn.user_id}`);
        }
    }

    console.log("Done!");
}

updateCredentials();
