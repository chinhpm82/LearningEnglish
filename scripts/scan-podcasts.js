/**
 * LearningEnglish - Automatic Podcast Asset Scanner & SRT Parser
 * ------------------------------------------------------------------
 * This script scans the /podcasts directory for paired .mp3 and .srt/.vtt files.
 * It automatically parses subtitle tracks, extracts metadata from filenames,
 * and compiles them into a static database file (data/podcast-data.js)
 * keeping the PWA application 100% offline-friendly and fast!
 * 
 * Usage:
 *   node scripts/scan-podcasts.js
 */

const fs = require('fs');
const path = require('path');

const PODCASTS_DIR = path.join(__dirname, '..', 'podcasts');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'podcast-data.js');

// Helper to parse SRT/VTT timestamps to seconds
function parseTime(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().replace(',', '.').split(':');
    if (parts.length === 3) {
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
    }
    return 0;
}

// Parse subtitle files into structural array
function parseSubtitleText(content) {
    const lines = content.replace(/\r/g, '').split('\n');
    const transcript = [];
    let currentItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Detect WEBVTT file header
        if (line.startsWith('WEBVTT')) continue;

        if (line.match(/^\d+$/)) {
            if (currentItem) {
                transcript.push(currentItem);
            }
            currentItem = { start: 0, end: 0, text: "" };
        } else if (line.includes('-->')) {
            const times = line.split('-->');
            if (times.length === 2) {
                if (!currentItem) {
                    currentItem = { start: 0, end: 0, text: "" };
                }
                currentItem.start = parseTime(times[0]);
                currentItem.end = parseTime(times[1]);
            }
        } else if (currentItem) {
            currentItem.text = currentItem.text ? currentItem.text + " " + line : line;
        }
    }
    if (currentItem) {
        transcript.push(currentItem);
    }
    return transcript;
}

function scan() {
    console.log('----------------------------------------------------');
    console.log('🎙️ STARTING PODCAST DIRECTORY ASSET SCANNING...');
    console.log('----------------------------------------------------');

    if (!fs.existsSync(PODCASTS_DIR)) {
        console.log(`📁 Directory /podcasts not found. Creating it...`);
        fs.mkdirSync(PODCASTS_DIR);
    }

    const files = fs.readdirSync(PODCASTS_DIR);
    const audioFiles = files.filter(f => f.toLowerCase().endsWith('.mp3'));

    console.log(`🔍 Found ${audioFiles.length} MP3 files in /podcasts`);

    const podcasts = [];

    audioFiles.forEach((file, index) => {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);

        // Guess Title and Speaker from filename
        // Convention: "Speaker - Topic Title.mp3" OR "Topic Title.mp3"
        let speaker = 'Unknown Speaker';
        let title = baseName;

        if (baseName.includes('-')) {
            const parts = baseName.split('-');
            speaker = parts[0].trim();
            title = parts.slice(1).join('-').trim();
        }

        // Search for matching subtitle srt or vtt
        let subFile = files.find(f => {
            const fName = f.toLowerCase();
            return (fName === `${baseName.toLowerCase()}.srt` || fName === `${baseName.toLowerCase()}.vtt`);
        });

        let transcript = [];
        if (subFile) {
            const subPath = path.join(PODCASTS_DIR, subFile);
            const content = fs.readFileSync(subPath, 'utf8');
            transcript = parseSubtitleText(content);
            console.log(`✅ [${index + 1}] Bound subtitles: "${subFile}" (${transcript.length} lines)`);
        } else {
            console.log(`⚠️ [${index + 1}] Warning: No subtitle found for "${file}". Please place a matching .srt file in /podcasts.`);
        }

        // Check if the MP3 file is zero-byte (like our placeholder files) to use SoundHelix fallback
        const filePath = path.join(PODCASTS_DIR, file);
        const stats = fs.statSync(filePath);
        let audioUrl = `podcasts/${file}`;
        let duration = 'Auto';
        
        if (stats.size === 0) {
            // Placeholder files fallback to stable streaming links
            if (title === 'Why Music Helps You Learn English') {
                audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
                duration = '6:12';
            } else if (title === 'The Magic of Lifelong Learning') {
                audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
                duration = '7:05';
            }
        }

        podcasts.push({
            id: `p-${index + 1}`,
            title: title,
            speaker: speaker,
            level: 'Podcast Level',
            desc: `Luyện nghe bài học tiếng Anh chủ đề: ${title}.`,
            audioUrl: audioUrl,
            image: '🎙️',
            duration: duration,
            transcript: transcript
        });
    });

    // Export as JSON for Firebase upload
    const jsonDir = path.join(__dirname, '..', 'json');
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }
    const jsonOutputFile = path.join(jsonDir, 'podcast-data.json');
    fs.writeFileSync(jsonOutputFile, JSON.stringify(podcasts, null, 4), 'utf8');

    console.log('----------------------------------------------------');
    console.log(`🎉 SUCCESS: Scanned ${podcasts.length} podcasts and exported to ${jsonOutputFile}`);
    console.log('----------------------------------------------------');
}

scan();
