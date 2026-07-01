import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
let envContent = fs.readFileSync(envPath, 'utf8');

const newUrl = 'NEW_SUPABASE_URL=https://vtnpmdzxifcknrcrdevy.supabase.co';
const newKey = 'NEW_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNTczNTksImV4cCI6MjA5NzkzMzM1OX0.NpOK3VShyI2zkYiwQMm84uldm4TAwzFoLeZoT5DSZLo';
const newServiceKey = 'NEW_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo';

// Replace NEW_SUPABASE_URL
envContent = envContent.replace(/^NEW_SUPABASE_URL=.*$/m, newUrl);
// Replace NEW_SUPABASE_KEY
envContent = envContent.replace(/^NEW_SUPABASE_KEY=.*$/m, newKey);
// Replace NEW_SUPABASE_SERVICE_ROLE_KEY
envContent = envContent.replace(/^NEW_SUPABASE_SERVICE_ROLE_KEY=.*$/m, newServiceKey);

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ Updated .env file successfully with vtnpmdzxifcknrcrdevy credentials');
