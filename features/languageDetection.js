/**
 * Language Detection Feature
 * Detects if message is in Kurdish (Sorani/Kirmanji)
 */

// Kurdish Unicode ranges for Sorani and Kirmanji
const kurdishPattern = /[\u0600-\u06FF]+/g; // Arabic script used for Kurdish

/**
 * Check if text is in Kurdish language
 * @param {string} text - The text to check
 * @returns {boolean} - True if text is in Kurdish, false otherwise
 */
const isKurdish = (text) => {
  if (!text) return false;
  
  // Count Kurdish characters
  const kurdishChars = text.match(kurdishPattern) || [];
  const totalChars = text.replace(/\s/g, '').length;
  
  // If more than 30% of text is Kurdish script, consider it Kurdish
  if (totalChars === 0) return false;
  
  const kurdishPercentage = (kurdishChars.join('').length / totalChars) * 100;
  return kurdishPercentage > 30;
};

/**
 * Get response message for non-Kurdish users
 * @returns {string} - Message in Kurdish asking user to speak in Kurdish
 */
const getNonKurdishResponse = () => {
  return `🚫 **ببورە، من تەنیا دەتوانم بە کوردی (سۆرانی و کرمانجی) وەڵام بدەمەوە!**\n\n` +
         `Min tenê dikarin bi Kurdî (Sorani û Kurmancî) bersiv bidem! 🇮🇶\n\n` +
         `_(Please speak in Kirmanji or Sorani Kurdish)_`;
};

module.exports = {
  isKurdish,
  getNonKurdishResponse,
};
