import crypto from 'node:crypto';
import { ENCRYPTION_KEY as key } from '../../config/config.service.js';

const ENCRYPTION_KEY = Buffer.from(
    key!,
    'utf8'
);
const IV_LENGTH = 16;

export function Encrypt(plainText:string):string {
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}


export function Decrypt(cipherText:string):string {

    const [ivHex, encryptedText] = cipherText.split(':');

    const iv = Buffer.from(ivHex!, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encryptedText!, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}
