const PROMPTS = require("./prompt");
/**
 *
 * @param {*} employees
 * @returns
 */
const buildPromptEmployee = (employees = []) => {
  if (!Array.isArray(employees)) {
    throw new Error("Debes ser un array de agentes");
  }

  employees.reduce((pre, ccu) => {
    if (pre.includes(ccu.name)) {
      throw new Error(`Nombre de agente debe ser unico: ${ccu.name} repetido`);
    }
    return [...pre, ccu.name];
  }, []);

  const agentsDescriptions = employees.map((agent) => ({
    [agent.name]: agent.description,
  }));
  const promptOutput = PROMPTS.FORMAT_INSTRUCTIONS.replace(
    "[{tool_names}]",
    JSON.stringify(agentsDescriptions)
  ).replaceAll("\n", " ");

  return promptOutput;
};

/**
 *
 * @param {*} text
 * @returns
 */
const determineEmployee = (text) => {
  const match = /Action: ([\s\S]*?)(?:\nAction Input: ([\s\S]*?))?$/.exec(text);
  if (!match) {
    throw new Error(`Could not parse LLM output: ${text}`);
  }

  try {
    return {
      tool: cleanText(match[1].trim()),
      toolInput: cleanText(
        match[2].trim().replace(/^("+)(.*?)(\1)$/, "$2") ?? ""
      ),
      log: cleanText(text),
    };
  } catch (e) {
    return {
      tool: null,
      toolInput: null,
      error: e.message,
    };
  }
};

/**
 * 
 * @param {*} message 
 * @param {*} parseInstructions 
 * @returns 
 */
const finalPrompt = (message, parseInstructions) => {
  const parseSuffix = PROMPTS.SUFFIX.replace('{input}', message)
  const PROMT = `${PROMPTS.PREFIX} ${parseInstructions} ${parseSuffix}`
  return PROMT
}

module.exports = { determineEmployee, finalPrompt, buildPromptEmployee };
