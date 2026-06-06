/**
 * Bad Words Filter Feature
 * Blocks messages containing bad words
 */

// Add your bad words here
const badWords = [
  'کێر',
  'قوز',
  'کیر',
  'زەکەر',
  'سێکس'
];

/**
 * Check if a message contains bad words
 * @param {string} message - The message to check
 * @returns {boolean} - True if bad words found, false otherwise
 */
const containsBadWords = (message) => {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();
  
  return badWords.some(word => {
    const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, 'gi');
    return regex.test(lowerMessage);
  });
};

/**
 * Add a bad word to the filter
 * @param {string} word - The word to add
 */
const addBadWord = (word) => {
  if (!badWords.includes(word.toLowerCase())) {
    badWords.push(word.toLowerCase());
  }
};

/**
 * Get all bad words (for management)
 * @returns {array} - List of all bad words
 */
const getBadWords = () => {
  return [...badWords];
};

module.exports = {
  containsBadWords,
  addBadWord,
  getBadWords,
};
