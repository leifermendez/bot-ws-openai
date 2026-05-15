const fs = require('node:fs/promises');

/**
 * Generates speech from text using ElevenLabs.
 * @param {string} text Text to synthesize.
 * @param {string} [voiceId] ElevenLabs voice id (defaults to a cloned voice).
 * @returns {Promise<string>} Absolute path of the generated mp3.
 */
const textToVoice = async (text, voiceId = 'vwfl76D5KBjKuSGfTbLB') => {
  const EVENT_TOKEN = process.env.EVENT_TOKEN ?? '';
  if (!EVENT_TOKEN) {
    throw new Error('EVENT_TOKEN no configurado (ElevenLabs API key)');
  }

  const URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  const headers = new Headers();
  headers.append('accept', 'audio/mpeg');
  headers.append('xi-api-key', EVENT_TOKEN);
  headers.append('Content-Type', 'application/json');

  const body = JSON.stringify({
    text,
    model_id: 'eleven_multilingual_v1',
    voice_settings: {
      stability: 1,
      similarity_boost: 0.8,
    },
  });

  const response = await fetch(URL, {
    method: 'POST',
    headers,
    body,
    redirect: 'follow',
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`ElevenLabs ${response.status}: ${errBody}`);
  }

  const buffer = await response.arrayBuffer();
  const pathFile = `${process.cwd()}/tmp/${Date.now()}-audio.mp3`;
  await fs.writeFile(pathFile, Buffer.from(buffer));

  return pathFile;
};

module.exports = { textToVoice };
