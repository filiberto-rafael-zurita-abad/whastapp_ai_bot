const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

console.log('Setting up WhatsApp client...');

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-extensions',
            '--disable-gpu'
        ]
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Generate and show QR code
client.on('qr', (qr) => {
    console.log('\n=== Please scan this QR code with WhatsApp ===\n');
    qrcode.generate(qr, { small: true });
    console.log('\n============================================\n');
});

// Loading screen event
client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

// Ready event
client.on('ready', () => {
    console.log('\n=== WhatsApp bot is ready! ===\n');
    console.log('Send a message to the bot to test it.');
});

// Handle incoming messages
client.on('message', async msg => {
    try {
        console.log('\nReceived message from:', msg.from);
        console.log('Message content:', msg.body);
        
        if (msg.isGroupMsg) {
            console.log('Ignoring group message');
            return;
        }

        // Generate AI response
        console.log('Generating AI response...');
        const prompt = `You are a helpful WhatsApp assistant. Keep your response concise and natural. User message: ${msg.body}`;
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        console.log('Generated response:', response);

        // Send the response
        console.log('Sending response...');
        await client.sendMessage(msg.from, response);
        console.log('Response sent successfully!\n');

    } catch (error) {
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        try {
            await client.sendMessage(msg.from, 'Sorry, I encountered an error while processing your message. Please try again.');
        } catch (sendError) {
            console.error('Failed to send error message:', sendError);
        }
    }
});

// Authentication event
client.on('authenticated', () => {
    console.log('Authentication successful!');
});

// Authentication failure event
client.on('auth_failure', (err) => {
    console.error('Authentication failed:', err);
});

// Disconnected event
client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Initialize client
console.log('Starting WhatsApp bot...');
console.log('Waiting for QR code...');

client.initialize().catch(err => {
    console.error('Failed to initialize:', err);
    console.error('Error details:', err.stack);
});
