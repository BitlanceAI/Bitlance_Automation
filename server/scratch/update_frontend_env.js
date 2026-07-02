import fs from 'fs';
import path from 'path';

const envPath = '/home/codebloodedsash/automation bitlance/billing-dashboard/.env.local';
let content = fs.readFileSync(envPath, 'utf8');

const urlPattern = /^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m;
const keyPattern = /^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/m;
const serviceKeyPattern = /^SUPABASE_SERVICE_ROLE_KEY=(.*)$/m;

const urlMatch = content.match(urlPattern);
const keyMatch = content.match(keyPattern);
const serviceKeyMatch = content.match(serviceKeyPattern);

console.log('Current NEXT_PUBLIC_SUPABASE_URL:', urlMatch ? urlMatch[1] : 'NOT FOUND');

// Let's update them to the credentials the user provided
const targetUrl = 'https://vtnpmdzxifcknrcrdevy.supabase.co';
const targetKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNTczNTksImV4cCI6MjA5NzkzMzM1OX0.NpOK3VShyI2zkYiwQMm84uldm4TAwzFoLeZoT5DSZLo';
const targetServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bnBtZHp4aWZja25yY3JkZXZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM1NzM1OSwiZXhwIjoyMDk3OTMzMzU5fQ.Zo-Ep_9HLWNeIFdfUNH_d5p7hngP4TU27XvVQNkgLBo';

content = content.replace(urlPattern, `NEXT_PUBLIC_SUPABASE_URL=${targetUrl}`);
content = content.replace(keyPattern, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${targetKey}`);
content = content.replace(serviceKeyPattern, `SUPABASE_SERVICE_ROLE_KEY=${targetServiceKey}`);

fs.writeFileSync(envPath, content, 'utf8');
console.log('✅ Updated frontend .env.local to use vtnpmdzxifcknrcrdevy successfully!');
