/**
 * Language Filter Feature
 * Forces bot responses to be in Kurdish Sorani and Kirmanji
 */

const createKurdishSystemPrompt = () => {
  return `You are a helpful AI assistant. You MUST respond ONLY in Kurdish language (Sorani and Kirmanji dialects). 
  
  IMPORTANT: 
  - Always respond in Kurdish Sorani or Kirmanji
  - Never respond in English or any other language
  - If asked something, respond in Kurdish
  - Mix both Sorani and Kirmanji when appropriate
  
  مهم: تێکڕایتان تنیا بە کوردی (سۆرانی و کرمانجی) وەڵام بدەن`;
};

const enhanceMessageWithKurdishPrompt = (userMessage) => {
  return `${userMessage}\n\n[Please respond ONLY in Kurdish Sorani/Kirmanji language]`;
};

module.exports = {
  createKurdishSystemPrompt,
  enhanceMessageWithKurdishPrompt,
};
