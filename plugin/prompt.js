const PROMPTS = {
    PREFIX: `Answer the following questions as best you can. You have access to the following tools:`,
    FORMAT_INSTRUCTIONS: `Use the following format in your response:
    
        Question: the input question you must answer
        Thought: you should always think about what to do
        Action: the action to take, should be one of [{tool_names}]
        Action Input: the input to the action
        Observation: the result of the action
        ... (this Thought/Action/Action Input/Observation can repeat N times)
        Thought: I now know the final answer
        Final Answer: the final answer to the original input question`,
    SUFFIX: `Begin!
    
        Question: {input}
        Thought:{agent_scratchpad}`,
    PROMPT_CHAIN: `You are provided with the following excerpts from a long document and a question. Provide a conversational response based on the context provided.
        You should only provide hyperlinks that reference the context below. DO NOT make up hyperlinks.
        If the question is not related to the context, politely respond that you are prepared to answer only questions related to the context.
        Question: {question}
        =========
        {context}
        =========
        Very short answer to send by whatsapp message:`,
    PROMPT_PREFIX_AGENT: `Act like an employee don't say your role. You will then be provided with a situation or question in quotes and then told how you should act remember you are an employee you follow some rules:`,
    PROMPT_END_AGENT: `Returns a ready-to-send response in a personal message.`,
  };

  module.exports = PROMPTS