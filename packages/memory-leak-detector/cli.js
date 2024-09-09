const CDP = require('chrome-remote-interface');

async function connect() {
    let client;
    try {
        client = await CDP({ port: 9222, host: "127.0.0.1" });
        console.log('Connected to Chrome!');
        // Perform operations using the client here
    } catch (err) {
        console.error('Error connecting to Chrome:', err);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

connect();

