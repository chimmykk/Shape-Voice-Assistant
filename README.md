# Voice Assistant Demo

A React Native voice assistant app powered by Shapes API and ElevenLabs TTS.

## Features

- 🎤 One-tap voice recording with auto-silence detection
- 🧠 AI responses via Shapes API
- 🔊 Text-to-speech using ElevenLabs
- 📱 Cross-platform (iOS/Android)

## Quick Start

### 1. Install Dependencies
```bash
npm install
npx expo install
```

### 2. Setup Backend
```bash
cd server
npm install
node index.cjs
```

### 3. Configure API Keys
Edit `server/index.cjs`:
```javascript
const SHAPES_API_KEY = "your-shapes-api-key";
const ELEVENLABS_API_KEY = "your-elevenlabs-api-key";
```

### 4. Run App
```bash
npx expo start
```

## Configuration

- **API Endpoint**: Update `API_ENDPOINT` in `apiService.ts` for your server URL
- **Voice**: Change `ELEVENLABS_VOICE_ID` in `index.cjs` for different voices

## Troubleshooting

- Ensure backend server is running on port 3000
- For physical devices, use your local IP or ngrok for the API endpoint
- Check network connectivity between app and server

## Tech Stack

- React Native + Expo
- Node.js backend
- Shapes API (AI responses)
- ElevenLabs (Text-to-speech)
- expo-audio (Voice recording)

## License

MIT