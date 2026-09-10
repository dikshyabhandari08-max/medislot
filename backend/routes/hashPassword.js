const bcrypt = require('bcrypt');
const db = require('../db');
require('dotenv').config();

const doctorId = 1;
const email = 'sarahsharma@medislot.com';
const plainPassword = 'doctor@222';

bcrypt.hash(plainPassword, 10).then((hashedPassword) => {
  db.query(
    'UPDATE doctors SET email = ?, password = ? WHERE id = ?',
    [email, hashedPassword, doctorId],
    (err, result) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.log(`Doctor ${doctorId} updated with email: ${email}`);
        console.log(`Login with email: ${email} / password: ${plainPassword}`);
      }
      process.exit();
    }
  );
});  