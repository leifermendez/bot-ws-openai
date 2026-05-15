require("dotenv").config();

const fs = require("node:fs/promises");
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const { init } = require("./plugin/plugin.employees");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { handlerAI } = require("./utils");
const { textToVoice } = require("./services/eventlab");

const employeesAddonConfig = {
  model: "gpt-4-0613",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};

const employeesAddon = init(employeesAddonConfig);

const flowStaff = addKeyword(EVENTS.ACTION).addAnswer(
  ["Claro que te interesa?", "mejor te envio audio.."],
  null,
  async (_, { flowDynamic, state }) => {
    console.log("🙉 texto a voz....");
    const currentState = state.getMyState();
    const path = await textToVoice(currentState.answer);
    console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
    try {
      await flowDynamic([{ body: "escucha", media: path }]);
    } finally {
      await fs.unlink(path).catch(() => {});
    }
  }
);

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, ctxFn) => {
    try {
      await ctxFn.flowDynamic("dame un momento para escucharte...🙉");
      console.log("🤖 voz a texto....");
      const text = await handlerAI(ctx);
      console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);
      const currentState = ctxFn.state.getMyState();
      const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
      const { employee, answer } = await employeesAddon.determine(fullSentence);
      ctxFn.state.update({ answer });
      employeesAddon.gotoFlow(employee, ctxFn);
    } catch (err) {
      console.error("❌ Error procesando nota de voz:", err);
      await ctxFn.flowDynamic(
        "Hubo un problema procesando tu mensaje, ¿podrías intentarlo de nuevo?"
      );
    }
  }
);

const main = async () => {
  const adapterDB = new MockAdapter();

  const adapterFlow = createFlow([flowVoiceNote, flowStaff]);

  const adapterProvider = createProvider(BaileysProvider);

  /**
   * 🤔 Empledos digitales
   * Imaginar cada empleado descrito con sus deberes de manera explicita
   */
  const employees = [
    {
      name: "EMPLEADO_STAFF_TOUR",
      description:
        "Soy Jorge el staff amable encargado de atentender las solicitudes de los viajeros si tienen dudas, preguntas sobre el tour o la ciudad de madrid, mis respuestas son breves.",
      flow: flowStaff,
    },
  ];

  employeesAddon.employees(employees);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
