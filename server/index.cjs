const express = require("express");
const { OpenAI } = require("openai");
// const fetch = require('node-fetch'); // Uncomment if using Node.js < 18 and installed node-fetch
// require('dotenv').config(); // No longer needed as keys are hardcoded

const app = express();
app.use(express.json({ limit: "10mb" }));

// --- Hardcoded API Keys and Configuration ---
const SHAPES_API_KEY = "HiocgM0BiVRdy7Dy0dWYdw7GWF4KfUId22TpN90yyuo";
const ELEVENLABS_API_KEY = "sk_7f079ad3bf82aea8b767e8f4fa8d24aee4999c0da933a4e2";
const ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Example Voice ID (Rachel). Change if you need a different voice.
// IMPORTANT: Review ELEVENLABS_VOICE_ID and change if needed. This is a common default one.
// --- End of Hardcoded Configuration ---

const shapes_client = new OpenAI({
  apiKey: SHAPES_API_KEY, // Using hardcoded key
  baseURL: "https://api.shapes.inc/v1",
});

app.post("/api/analyze-audio", async (req, res) => {
  try {
    const audioDataUrl = req.body.audio; // Expecting a full data URL from the client

    if (!audioDataUrl || typeof audioDataUrl !== 'string') {
      return res.status(400).json({ error: "Missing or invalid audio data URL in request body." });
    }

    // 1. Send audio to Shapes API for transcription and response
    const shapesResponse = await shapes_client.chat.completions.create({
      model: "shapesinc/tenshi",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Please transcribe and respond to this audio message" },
            { type: "audio_url", audio_url: { url: audioDataUrl } },
          ],
        },
      ],
    });

    const aiText = shapesResponse.choices[0].message.content;

    // 2. Convert AI text response to speech using ElevenLabs
    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
      console.error("ElevenLabs API Key or Voice ID is not properly set (hardcoded).");
      return res.status(500).json({ error: "Text-to-speech service configuration error on server." });
    }

    const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`;
    const elevenLabsTtsResponse = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY, // Using hardcoded key
      },
      body: JSON.stringify({
        text: aiText,
        model_id: 'eleven_monolingual_v1', // Or your preferred model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        },
      }),
    });

    if (!elevenLabsTtsResponse.ok) {
      const errorBody = await elevenLabsTtsResponse.text();
      console.error(`ElevenLabs API Error: ${elevenLabsTtsResponse.status} ${elevenLabsTtsResponse.statusText}`, errorBody);
      throw new Error(`Failed to get TTS from ElevenLabs: ${elevenLabsTtsResponse.statusText}`);
    }

    const audioArrayBuffer = await elevenLabsTtsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');

    res.json({
      text: aiText,
      audio_url: `data:audio/mpeg;base64,${audioBase64}`,
    });

  } catch (error) {
    console.error("Error processing audio:", error);
    const errorMessage = error.response?.data?.error?.message ||
                         error.message ||
                         "Server error occurred during audio processing.";
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 3000; // You can also hardcode PORT if you remove all .env usage
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));