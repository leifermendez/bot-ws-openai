const { downloadMediaMessage } = require('@adiwajshing/baileys');
const fs = require('node:fs/promises');
const { convertOggMp3 } = require('./services/convert');
const { voiceToText } = require('./services/whisper');

const handlerAI = async (ctx) => {
  const buffer = await downloadMediaMessage(ctx, 'buffer');
  const timestamp = Date.now();
  const pathTmpOgg = `${process.cwd()}/tmp/voice-note-${timestamp}.ogg`;
  const pathTmpMp3 = `${process.cwd()}/tmp/voice-note-${timestamp}.mp3`;

  try {
    await fs.writeFile(pathTmpOgg, buffer);
    await convertOggMp3(pathTmpOgg, pathTmpMp3);
    return await voiceToText(pathTmpMp3);
  } finally {
    await Promise.allSettled([
      fs.unlink(pathTmpOgg),
      fs.unlink(pathTmpMp3),
    ]);
  }
};

module.exports = { handlerAI };
