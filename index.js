//const { MlKem768 } = require('mlkem');
const { MlKem1024 } = require('mlkem');

async function main() {
    try {
        const message = Buffer.from('Hello, post-quantum world!');
        console.log('\nMessage:', message.toString());

        console.log('\n\nNow demonstrating ML-KEM (Kyber)... ');
        const kem = new MlKem1024();
        //const kem = new MlKem768();
        const [publicKey, privateKey] = await kem.generateKeyPair();
        console.log('ML-KEM key pair generated successfully');

        console.log('\nEncapsulating...');
        const [ciphertext, sharedSecret] = await kem.encap(publicKey);
        console.log('Encapsulation successful');

        console.log('Ciphertext:', typeof ciphertext, 'is Buffer?', Buffer.isBuffer(ciphertext), 'Length:', ciphertext ? ciphertext.length : 'N/A', 'Ciphertext:', ciphertext);

        console.log('\nDecapsulating...');
        console.log('DECAP INPUTS:');
        console.log('Ciphertext type:', typeof ciphertext, 'is Buffer?', Buffer.isBuffer(ciphertext), 'Length:', ciphertext ? ciphertext.length : 'N/A');
        console.log('PrivateKey type:', typeof privateKey, 'is Buffer?', Buffer.isBuffer(privateKey), 'Length:', privateKey ? privateKey.length : 'N/A');
        console.log('publicKey type:', typeof publicKey, 'is Buffer?', Buffer.isBuffer(publicKey), 'Length:', publicKey ? publicKey.length : 'N/A');
        console.log('sharedSecret (from encap) type:', typeof sharedSecret, 'is Buffer?', Buffer.isBuffer(sharedSecret), 'Length:', sharedSecret ? sharedSecret.length : 'N/A');

        const decryptedSharedSecret = await kem.decap(ciphertext, privateKey);
        console.log('Decapsulation successful');

        const secretsMatch = Buffer.compare(sharedSecret, decryptedSharedSecret) === 0;
        console.log('\nShared secrets match:', secretsMatch);

        console.log('\nML-KEM (Kyber768) key sizes:');
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