const crypto = require('crypto');

const iv = Buffer.alloc(16, 0);
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.TOKEN_SECRET, 'GfG', 32);

class CryptoService {
  static encrypt(data) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedData = cipher.update(data, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return encryptedData;
  }

  static decrypt(encData) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let data = decipher.update(encData, 'hex', 'utf-8');
    data += decipher.final('utf8');
    return data;
  }
}

module.exports = CryptoService;
