const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY is missing from .env');
    process.exit(1);
}

// You can choose a different voice ID if preferred.
// Here are a few popular ElevenLabs standard voices:
// Rachel: 21m00Tcm4TlvDq8ikWAM
// Drew: 29vD33N1CtxCmqQRPOZB
// Clyde: 2EiwWnXFnvU5JabPnv8n
// Adam: pNInz6obpgDQGcFmaJgB
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam

const PLACEMENT_JSON_DIR = path.join(__dirname, '..', 'json', 'placement');
const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'audio', 'listening');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
    fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

async function generateAudio(text, outputPath) {
    if (fs.existsSync(outputPath)) {
        console.log(`Audio already exists: ${outputPath}, skipping...`);
        return true;
    }
    
    try {
        const response = await axios({
            method: 'post',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            data: {
                text: text,
                model_id: 'eleven_multilingual_v2', // Using v2 which is supported on the free tier
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            },
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    console.log(`Generated: ${outputPath}`);
                    resolve(true);
                }
            });
        });
    } catch (error) {
        if (error.response && error.response.status !== 200) {
            console.error(`Failed to generate audio (Status ${error.response.status})`);
        } else {
            console.error(`Failed to generate audio for text: "${text}"`, error.message);
        }
        return false;
    }
}

async function processFiles() {
    const files = fs.readdirSync(PLACEMENT_JSON_DIR).filter(f => f.startsWith('listening-') && f.endsWith('.json'));
    
    for (const file of files) {
        const filePath = path.join(PLACEMENT_JSON_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let modified = false;

        for (const question of data) {
            if (question.audioText && !question.audioUrl) {
                const audioFilename = `${question.id}.mp3`;
                const audioPath = path.join(AUDIO_OUTPUT_DIR, audioFilename);
                
                console.log(`Processing ${question.id}...`);
                const success = await generateAudio(question.audioText, audioPath);
                
                if (success) {
                    // Path relative to web root
                    question.audioUrl = `audio/listening/${audioFilename}`;
                    modified = true;
                }
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Updated JSON file: ${file}`);
        }
    }
    
    console.log("Done generating listening audios!");
}

processFiles().catch(console.error);
