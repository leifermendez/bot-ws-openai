const fs = require("fs");
const { Configuration, OpenAIApi } = require("openai");

/**
 *
 * @param {*} path url mp3
 */
const voiceToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const resp = await openai.createTranscription(
      fs.createReadStream(path),
      "whisper-1"
    );

    return resp.data.text;
  } catch (err) {
    console.log(err.response.data)
    return "ERROR";
  }
};

module.exports = { voiceToText };
