import dotenv from 'dotenv';
dotenv.config();

console.log('Keys in process.env:');
for (const key of Object.keys(process.env)) {
    if (key.includes('DB') || key.includes('CONN') || key.includes('POSTGRES') || key.includes('URL') || key.includes('KEY')) {
        console.log(`- ${key}: ${process.env[key] ? 'PRESENT (len ' + process.env[key].length + ')' : 'EMPTY'}`);
    }
}
