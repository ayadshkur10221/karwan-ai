/**
 * Command Handler
 * Handles `/setup` slash command and legacy message handler
 */

const { saveChannelConfig, getChannelConfig } = require('./database');
const { sendSetupMessage } = require('./threadManager');
const { PermissionsBitField } = require('discord.js');

/**
 * Handle setup command
 * @param {Message} message - Discord message
 * @param {string} args - Command arguments
 */
const handleSetupCommand = async (message, args) => {
  try {
    // Check if user has admin permissions
    if (!message.member.permissions.has('Administrator')) {
      await message.channel.send('❌ You need administrator permissions to use this command!');
      return;
    }

    // Get mentioned channel or parse channel ID
    let channel = message.mentions.channels.first();
    
    if (!channel && args.length > 0) {
      // Try to get channel by ID
      channel = message.guild.channels.cache.get(args[0]);
    }

    if (!channel) {
      await message.channel.send(
        '❌ Please specify a channel!\n\nUsage: `/setup <#channel>`'
      );
      return;
    }

    // Save configuration to database
    await saveChannelConfig(message.guildId, channel.id);

    await message.channel.send(
      `✅ **Setup Complete!**\n\n<#${channel.id}>\n\nYou can change this anytime with /setup`
    );

    console.log(`✅ Server ${message.guild.name} configured to use channel ${channel.name}`);
  } catch (error) {
    console.error('Setup command error:', error);
    await message.channel.send('❌ An error occurred while setting up the bot!');
  }
};

// parseCommand removed — slash commands are used instead

/**
 * Register slash commands for all guilds the bot is in (fast propagation)
 * @param {Client} client
 */
const registerSlashCommands = async (client) => {
  const setupCommand = {
    name: 'setup',
    description: 'Configure the bot channel for this server',
    options: [
      {
        name: 'channel',
        description: 'The channel to set for the bot',
        type: 7, // CHANNEL
        required: true,
      },
    ],
  };

  // Register per-guild for instant availability
  for (const [, guild] of client.guilds.cache) {
    try {
      await guild.commands.create(setupCommand);
    } catch (err) {
      console.error(`Failed to register commands for guild ${guild.id}:`, err);
    }
  }
};

/**
 * Handle /setup slash command
 * @param {ChatInputCommandInteraction} interaction
 */
const handleSetupInteraction = async (interaction) => {
  const channel = interaction.options.getChannel('channel');

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({ content: '❌ You need administrator permissions to use this command!', ephemeral: true });
    return;
  }

  if (!channel) {
    await interaction.reply({ content: '❌ Please provide a channel.', ephemeral: true });
    return;
  }

  try {
    await saveChannelConfig(interaction.guildId, channel.id);
    await sendSetupMessage(interaction.guild, interaction.client);
    await interaction.reply({ content: `✅ **Setup Complete!**\n\n<#${channel.id}>\n\nYou can change this anytime with /setup`, ephemeral: false });
    console.log(`✅ Server ${interaction.guild.name} configured to use channel ${channel.name}`);
  } catch (error) {
    console.error('Setup interaction error:', error);
    await interaction.reply({ content: '❌ An error occurred while setting up the bot!', ephemeral: true });
  }
};

module.exports = {
  handleSetupCommand,
  registerSlashCommands,
  handleSetupInteraction,
};
