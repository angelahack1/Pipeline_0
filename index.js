const crypto = require('crypto');
//const { MlKem768 } = require('mlkem');
const { MlKem1024 } = require('mlkem');

async function main() {
    try {
        console.log('\n\nNow demonstrating ML-KEM (Kyber)... ');
        const kem = new MlKem1024();
        //const kem = new MlKem768();
        // A) Yo cliente, genero public Key y Private Key...
        const [publicKey, privateKey] = await kem.generateKeyPair();
        console.log('ML-KEM key pair generated successfully');

        // B) Yo cliente le mando la clave public al Servidor/Core del sistema...

        console.log('\nEncapsulating...');
        // C) Yo Servidor/Core del sistema genero/encapsulo un ciphertext y un sharedSecret...
        const [ciphertext, sharedSecret] = await kem.encap(publicKey);
        console.log('Encapsulation successful');

        // D) Yo Servidor/Core del sistema le mando el ciphertext al cliente...

        console.log('Ciphertext:', typeof ciphertext, 'is Buffer?', Buffer.isBuffer(ciphertext), 'Length:', ciphertext ? ciphertext.length : 'N/A', 'Ciphertext:', ciphertext);

        console.log('\nDecapsulating...');
        console.log('DECAP INPUTS:');
        console.log('Ciphertext type:', typeof ciphertext, 'is Buffer?', Buffer.isBuffer(ciphertext), 'Length:', ciphertext ? ciphertext.length : 'N/A');
        console.log('PrivateKey type:', typeof privateKey, 'is Buffer?', Buffer.isBuffer(privateKey), 'Length:', privateKey ? privateKey.length : 'N/A');
        console.log('publicKey type:', typeof publicKey, 'is Buffer?', Buffer.isBuffer(publicKey), 'Length:', publicKey ? publicKey.length : 'N/A');
        console.log('sharedSecret (from encap) type:', typeof sharedSecret, 'is Buffer?', Buffer.isBuffer(sharedSecret), 'Length:', sharedSecret ? sharedSecret.length : 'N/A');

        // E) Yo cliente, decapsulo el ciphertext y obtengo el sharedSecret...
        const decryptedSharedSecret = await kem.decap(ciphertext, privateKey);
        console.log('Decapsulation successful');
        console.log('DecryptedSharedSecret (from encap) type:', typeof decryptedSharedSecret, 'is Buffer?', Buffer.isBuffer(decryptedSharedSecret), 'Length:', decryptedSharedSecret ? decryptedSharedSecret.length : 'N/A');

        // F) EN implementaciones futuras en vez de comparar el sharedSecret, simplemente uso el sharedSecret para cifrar mis mensajes que envíe al servidor/core del sistema...
        const secretsMatch = Buffer.compare(sharedSecret, decryptedSharedSecret) === 0;
        console.log('\nShared secrets match:', secretsMatch);

        if (secretsMatch) {
            // G) Yo cliente, preparo el mensaje a enviar...
            const messageToEncrypt = Buffer.from('Hello, post-quantum world with AES-GCM!, ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ,ABCDEFGHIJKLMNOPQRSTUVWXYZ.');
            console.log('\nOriginal Message:', messageToEncrypt.toString());

            // H) Yo cliente, cifro el mensaje usando el sharedSecret (obtenido de Kyber) con AES-256-GCM.
            // AES-256-GCM requires a 256-bit (32-byte) key, which sharedSecret is.
            // It also requires an Initialization Vector (IV), which should be unique for each encryption with the same key.
            const iv = crypto.randomBytes(32); // 12 bytes is recommended for GCM.
            const cipher = crypto.createCipheriv('aes-256-gcm', sharedSecret, iv);

            let encryptedMessage = cipher.update(messageToEncrypt);
            encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);
            const authTag = cipher.getAuthTag(); // GCM provides an authentication tag.

            console.log('Encrypted Message (hex):', encryptedMessage.toString('hex'));
            console.log('IV (hex):', iv.toString('hex'));
            console.log('Auth Tag (hex):', authTag.toString('hex'));

            // I) Yo cliente, le mando al servidor: encryptedMessage, iv, y authTag.






            ///>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>






            // J) El servidor (o con fines demostrativos, el cliente mismo) descifra el mensaje.
            // El servidor usaría el mismo sharedSecret (que obtuvo a través de su propio kem.decap o kem.encap).
            const decipher = crypto.createDecipheriv('aes-256-gcm', sharedSecret, iv);
            decipher.setAuthTag(authTag);

            let decryptedMessageBuffer = decipher.update(encryptedMessage);
            decryptedMessageBuffer = Buffer.concat([decryptedMessageBuffer, decipher.final()]);

            // K) Con fines demostrativos voy a imprimir el mensaje descifrado...
            console.log('\nDecrypted Message:', decryptedMessageBuffer.toString());

            const messagesMatch = Buffer.compare(messageToEncrypt, decryptedMessageBuffer) === 0;
            console.log('Original and Decrypted messages match:', messagesMatch);
        } else {
            console.error('\nError: Shared secrets do not match. Cannot proceed with symmetric encryption.');
        }

        console.log('\nML-KEM (Kyber1024) key sizes:');
        console.log('Public key size:', publicKey.length, 'bytes');
        console.log('Private key size:', privateKey.length, 'bytes');
        console.log('Ciphertext size:', ciphertext.length, 'bytes');
        console.log('Shared secret size:', sharedSecret.length, 'bytes');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    }
}

main();