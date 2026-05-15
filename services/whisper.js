const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

/**
 * Transcribes an mp3 file using OpenAI Whisper.
 * @param {string} path Absolute path to the mp3 file.
 * @returns {Promise<string>} Transcribed text.
 * @throws If the file is missing or the API call fails.
 */
const voiceToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error(`No se encuentra el archivo: ${path}`);
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );
    return resp.data.text;
  } catch (err) {
    const detail = err?.response?.data ?? err?.message ?? err;
    throw new Error(`Whisper transcription failed: ${JSON.stringify(detail)}`);
  }
};

module.exports = { voiceToText };
