/**
 * About Bot Feature
 * Handles questions about the bot itself
 */

const { EmbedBuilder } = require('discord.js');

const botInfo = {
  name: 'Karwan',
  creator: 'Ayad',
  language: 'Kurdish (Sorani & Kirmanji)',
  description: 'An AI-powered Discord bot that speaks only in Kurdish',
};

// Keywords that trigger the about response
const aboutKeywords = [
  'کاروان',
  'about',
  'who are you',
];

/**
 * Check if message is asking about the bot
 * @param {string} message - The message to check
 * @returns {boolean} - True if asking about bot
 */
const isAskingAboutBot = (message) => {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();
  return aboutKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
};

/**
 * Get bot information response in Kurdish
 * @returns {string} - Bot information message
 */
const getBotInfoResponse = () => {
  return `سڵاو! 👋\n\n` +
         `ناوی من **${botInfo.name}** ە!\n` +
         `من لەلایەن **${botInfo.creator}** دروست کراوم\n\n` +
         "`Karwan v0.2 Beta`";
         
};

module.exports = {
  isAskingAboutBot,
  getBotInfoResponse,
  botInfo,
};
