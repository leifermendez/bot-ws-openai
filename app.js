require("dotenv").config();

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const { init } = require("bot-ws-plugin-openai");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { handlerAI } = require("./utils");
const { textToVoice } = require("./services/eventlab");

/**
 *
 * Plugin settings
 * https://platform.openai.com/docs/api-reference
 *
 */

const employeesAddonConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};
const employeesAddon = init(employeesAddonConfig);

/**
 *
 * 🙉 Flow del Bot
 * https://bot-whatsapp.netlify.app/docs/flows/
 *
 */

const flowVentas = addKeyword(["pedir", "ordenar"]).addAnswer(
  ["Claro que te interesa?", "mejor te envio audio.."],
  null,
  async (_, { flowDynamic }) => {
    console.log("🙉 texto a voz....");
    const path = await textToVoice(
      "Si claro como te puedo ayudar si gustas enviame detalle de tecnicos que necesitas para tu servidor"
    );
    console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
    await flowDynamic([{ body: "escucha", media: path }]);
  }
);

const flowSoporte = addKeyword(["necesito ayuda"]).addAnswer(
  "Claro como te puedo ayudar?"
);

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
  async (ctx, ctxFn) => {
    await ctxFn.flowDynamic("dame un momento para escucharte...🙉");
    console.log("🤖 voz a texto....");
    const text = await handlerAI(ctx);
    console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);

    const empleado = await employeesAddon.determine(text); //TODO<===
    employeesAddon.gotoFlow(empleado, ctxFn);

  }
);

const flowDemo = addKeyword("demo").addAction((ctx, { gotoFlow }) => {
  gotoFlow(flowVentas);
});

const main = async () => {
  const adapterDB = new MockAdapter();

  const adapterFlow = createFlow([
    flowVoiceNote,
    flowVentas,
    flowSoporte,
    flowDemo,
  ]);

  const adapterProvider = createProvider(BaileysProvider);

  /**
   * 🤔 Empledos digitales
   * Imaginar cada empleado descrito con sus deberes de manera explicita
   */
  const employees = [
    {
      name: "EMPLEADO_VENDEDOR",
      description:
        "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves. Envia 1-3 emojis:🤖 🚀 🤔",
      flow: flowVentas,
    },
    {
      name: "EMPLEADO_DEVOLUCIONES",
      description:
        "Soy Steffany, encargada de las devoluciones, reembolsos problemas que tengas con tus productos. mis respuestas breves.",
      flow: flowSoporte,
    },
  ];

  employeesAddon.employees(employees);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
};

main();
