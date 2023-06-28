const crypto = require('crypto');

export const encrypt = (text, key) => {
    const encoder = new TextEncoder();
    let buffer_key = Uint8Array.from([...encoder.encode(key), ...new Uint8Array(32 - key.length)]);
    let iv = Uint8Array.from([...encoder.encode(key), ...new Uint8Array(16 - key.length)]);
    let cipher = crypto.createCipheriv(
         'aes-256-cbc', Buffer.from(buffer_key), iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted
}

export const decrypt = (text, key) => {
    const encoder = new TextEncoder();
    let buffer_key = Uint8Array.from([...encoder.encode(key), ...new Uint8Array(32 - key.length)]);
    let iv = Uint8Array.from([...encoder.encode(key), ...new Uint8Array(16 - key.length)]);
    let decipher = crypto.createDecipheriv(
         'aes-256-cbc', Buffer.from(buffer_key), iv);
    let decrypted = decipher.update(text, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export const getUniqueKey = (maxSize = 15) => {
    const crypto = require('crypto');
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const data = crypto.randomBytes(maxSize);
    let result = '';

    for (let i = 0; i < maxSize; i++) {
        result += chars[data[i] % chars.length];
    }

    return result.toUpperCase();
}
