const OpenAiClass = require("./openai.class");
const { determineAgent } = require("../services/determine");
const { buildPromptEmployee, finalPrompt } = require("./employee.rol");
const { cleanText } = require("./util");
const PROMPTS = require("./prompt");

class EmployeesClass extends OpenAiClass {
  listEmployees = [];

  constructor(_settings) {
    super(_settings);
  }

  employees = (employees = []) => {
    this.listEmployees = employees;
  };

  getAgent = (employeeName) => {
    return this.listEmployees.find((emp) => emp.name === employeeName);
  };

  /**
   * Routes the user input to the best-matching employee and produces an answer
   * in that employee's voice.
   * @param {string} text User input.
   * @returns {Promise<{ employee: object, answer: string }>}
   */
  determine = async (text) => {
    const routerPrompt = finalPrompt(
      text,
      buildPromptEmployee(this.listEmployees)
    );

    const routerResp = await this.sendChat([
      { role: "user", content: cleanText(routerPrompt) },
    ]);

    if (routerResp?.error) {
      throw new Error(routerResp.error.message);
    }

    const choice = determineAgent(routerResp.choices[0].message.content);
    const employee = this.getAgent(choice.tool);
    if (!employee) {
      throw new Error(`Empleado no encontrado: ${choice.tool}`);
    }

    const systemPrompt = `${PROMPTS.PROMPT_PREFIX_AGENT} ${employee.description} ${PROMPTS.PROMPT_END_AGENT}`;
    const answerResp = await this.sendChat([
      { role: "system", content: cleanText(systemPrompt) },
      { role: "user", content: text },
    ]);

    if (answerResp?.error) {
      throw new Error(answerResp.error.message);
    }

    return {
      employee,
      answer: answerResp.choices[0].message.content,
    };
  };

  gotoFlow = (employee, ctxFn) => {
    ctxFn.gotoFlow(employee.flow);
  };
}

const init = (settings) => new EmployeesClass(settings);

module.exports = { EmployeesClass, init };
