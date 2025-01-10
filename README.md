# WhatsApp AI Bot

A WhatsApp bot that uses Google's Gemini AI to automatically respond to messages.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

3. Run the bot:
```bash
npm start
```

4. Scan the QR code with WhatsApp mobile app when prompted

## Features

- Automatically responds to direct messages using Gemini AI
- Ignores group messages
- Maintains session using local authentication
- Provides clear console logging for monitoring

## Technologies Used

- whatsapp-web.js: For WhatsApp Web automation
- @google/generative-ai: Google's Gemini AI API
- Node.js: Runtime environment
