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
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    }
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        await client.destroy();
        console.log('WhatsApp client destroyed');
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});

// Add more detailed error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    if (reason instanceof Error) {
        console.error('Stack:', reason.stack);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
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
    console.log('\n=== WhatsApp bot is ready! ===');
    console.log('Waiting for messages...');
    console.log('GEMINI_API_KEY status:', !!process.env.GEMINI_API_KEY);
});

// Handle incoming messages
client.on('message', async msg => {
    try {
        console.log('\n=== New Message Received ===');
        console.log('From:', msg.from);
        console.log('Message:', msg.body);
        console.log('Is Group Message:', msg.isGroupMsg);
        
        if (msg.isGroupMsg) {
            console.log('Ignoring group message');
            return;
        }

        // Generate AI response
        console.log('Generating AI response...');
        console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
        
        const prompt = `You are the AestheteMED bot assistant. Your job is to provide provide information about traetments and try to get a data and time for 
        an appoitment while speaking to the customer. 
        
        Keep your response concise and natural. Only say Hello o Greet if greeted. Dont send messages saying hello or who you are if the customer doesnt greet you. 

        When the user asks you for a prices, respond by letting them know all that information is
        available in the WhatsApp catalog in your user profile.

        The treatments we are currently offering are the UltraClear Laser, Endolift Laser, 
        NAD+ IV Thearpy, IV Anti-Aging Therapy, Hair Recovery PRP, Venus Bliss, PDO MINT Threads, PDO Liftthign Threads, Mesotherapy for Dark Circles, Eye Bag Removal, Morpheus8, and Liposhot Injection by Toskani. 

        Answer questions about the aesthetic treatments we offer. Dont engage in conversation about anything else.

        Use prettified style, with spacing and professional looking emojis.
        
        User message: ${msg.body}`;
        
        console.log('Sending prompt to Gemini...');
        
        try {
            const result = await model.generateContent(prompt);
            console.log('Received response from Gemini');
            const response = result.response.text();
            console.log('Processed response:', response);

            // Send the response
            console.log('Sending message to WhatsApp...');
            await msg.reply(response);
            console.log('Message sent successfully');
        } catch (aiError) {
            console.error('Gemini API Error:', aiError);
            console.error('Error details:', {
                name: aiError.name,
                message: aiError.message,
                stack: aiError.stack
            });
            throw aiError;
        }

    } catch (error) {
        console.error('Message handling error:', error);
        console.error('Stack trace:', error.stack);
        try {
            await msg.reply('I apologize, but I encountered an error. Please try again.');
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
    console.error('Failed to initialize client:', err);
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});
