const { cleanText } = require('../plugin/util');

/**
 * Parses an LLM ReAct-style response into the chosen tool/agent.
 * @param {string} text Raw LLM output.
 * @returns {{ tool: string|null, toolInput: string|null, log?: string, error?: string }}
 */
const determineAgent = (text) => {
  const match = /Action: ([\s\S]*?)(?:\nAction Input: ([\s\S]*?))?$/.exec(text);
  if (!match) {
    throw new Error(`Could not parse LLM output: ${text}`);
  }

  try {
    return {
      tool: cleanText(match[1].trim()),
      toolInput: cleanText(
        (match[2] ?? '').trim().replace(/^("+)(.*?)(\1)$/, '$2')
      ),
      log: cleanText(text),
    };
  } catch (e) {
    return { tool: null, toolInput: null, error: e.message };
  }
};

module.exports = { determineAgent };
