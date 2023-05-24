const OpenAiClass = require("./openai.class");
const { determineAgent } = require("../services/determine");
const { buildPromptEmployee, finalPrompt } = require("./employee.rol");
const { cleanText } = require("./util");

class EmployeesClass extends OpenAiClass {
  listEmployees = [];

  constructor(_settings) {
    super(_settings);
  }

  /**
   *
   * @param {*} employees [] array
   */
  employees = (employees = []) => {
    this.listEmployees = employees;
  };

  /**
   *
   * @param {*} employeeName
   * @returns
   */
  getAgent = (employeeName) => {
    const indexEmployee = this.listEmployees.findIndex(
      (emp) => emp.name === employeeName
    );
    return this.listEmployees[indexEmployee];
  };

  /**
   *
   */
  determine = async (text) => {
    try {

      const promptOutput = finalPrompt(
        text,
        buildPromptEmployee(this.listEmployees)
      );

      const llmDetermineEmployee = await this.sendChat([
        {
          role: "user",
          content: cleanText(promptOutput),
        },
      ]);


      if(llmDetermineEmployee?.error){
        throw new Error(llmDetermineEmployee?.error?.message)
      }

      const bestChoise = determineAgent(
        llmDetermineEmployee.choices[0].message.content
      );
      const employee = this.getAgent(bestChoise.tool);
      return employee;

    } catch (err) {
      console.log(err);
      return `ERROR_DETERMINANDO_EMPELADO: ${err.message}`;
    }
  };

  /**
   * @param {*} employee 
   * @param {*} ctxFn 
   */
  _gotoFlow = (employee, ctxFn) => {
    const flow = employee.flow
    ctxFn.gotoFlow(flow)
  }
}

module.exports = EmployeesClass;
