const crypto = require('crypto');

const PASSWORD_SALT_ROUNDS = 310000;

const generatePasswordHash = async (password, salt) => new Promise((resolve, reject) => {
  crypto.pbkdf2(password, salt, PASSWORD_SALT_ROUNDS, 32, 'sha256', (err, hashedPassword) => {
    if (err) reject(err);
    else resolve(hashedPassword);
  });
});

module.exports = {
  generatePasswordHash,
};
