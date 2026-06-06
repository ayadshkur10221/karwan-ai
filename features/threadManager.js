/**
 * Thread Management Feature
 * Handles private threads for user conversations
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const { getChannelConfig } = require('./database');

const THREAD_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours
const activeThreads = new Map(); // Store active threads per user

/**
 * Send setup message with button in configured channel
 * @param {Guild} guild - Discord guild
 * @param {Client} client - Discord client
 */
const sendSetupMessage = async (guild, client) => {
  try {
    const channelId = await getChannelConfig(guild.id);
    if (!channelId) {
      console.log(`No channel configured for guild ${guild.id}`);
      return;
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      console.log(`Channel not found for guild ${guild.id}`);
      return;
    }

    const button = new ButtonBuilder()
      .setCustomId('start_chat')
      .setLabel('💬 دەستپێکردنی چات')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
      content: '👋 **سڵاو چۆنی!**\n\n> بۆ دەستپێکردنی گفتوگۆیەکی تایبەت لەگەڵم\n> کلیک لەم دوگمەیەی خوارەوە بکە',
      components: [row],
    });

    console.log(`✅ Setup message sent to ${channel.name}`);
  } catch (error) {
    console.error('Error sending setup message:', error);
  }
};

/**
 * Check if user has an active thread
 * @param {string} userId - Discord user ID
 * @returns {boolean} - True if user has active thread
 */
const hasActiveThread = (userId) => {
  return activeThreads.has(userId);
};

/**
 * Get active thread for user
 * @param {string} userId - Discord user ID
 * @returns {string} - Thread ID or null
 */
const getActiveThread = (userId) => {
  return activeThreads.get(userId) || null;
};

/**
 * Create a private thread for user
 * @param {User} user - Discord user
 * @param {Channel} parentChannel - Parent channel
 * @returns {Promise} - Resolves with thread
 */
const createUserThread = async (user, parentChannel) => {
  try {
    if (hasActiveThread(user.id)) {
      return null; // User already has active thread
    }

    const thread = await parentChannel.threads.create({
      name: `💬-${user.username}`,
      autoArchiveDuration: 60, // Archive after 1 hour of inactivity
      type: ChannelType.PrivateThread,
    });

    // Add user to thread
    await thread.members.add(user.id);

    // Add bot to thread so it can read messages
    await thread.members.add(parentChannel.client.user.id);

    // Store in active threads
    activeThreads.set(user.id, thread.id);

    // Schedule deletion after 12 hours
    setTimeout(() => {
      deleteUserThread(user.id, thread);
    }, THREAD_DURATION_MS);

    return thread;
  } catch (error) {
    console.error('Error creating thread:', error);
    return null;
  }
};

/**
 * Delete user thread
 * @param {string} userId - Discord user ID
 * @param {Thread} thread - Discord thread
 */
const deleteUserThread = async (userId, thread) => {
  try {
    await thread.delete('Auto-deletion after 12 hours');
    activeThreads.delete(userId);
    console.log(`✅ Thread deleted for user ${userId}`);
  } catch (error) {
    console.error('Error deleting thread:', error);
    activeThreads.delete(userId);
  }
};

/**
 * Remove user thread on exit
 * @param {string} userId - Discord user ID
 */
const removeUserThread = (userId) => {
  activeThreads.delete(userId);
};

module.exports = {
  sendSetupMessage,
  hasActiveThread,
  getActiveThread,
  createUserThread,
  deleteUserThread,
  removeUserThread,
};
