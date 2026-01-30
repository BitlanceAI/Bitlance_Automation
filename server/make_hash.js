
import bcrypt from 'bcrypt';
import fs from 'fs';

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
    if (err) {
        console.error(err);
        return;
    }
    fs.writeFileSync('hash.txt', hash);
    console.log('Done');
});
