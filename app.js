require('dotenv').config();
const { Client, IntentsBitField, ChannelType } = require('discord.js');
const { init } = require('@heyputer/puter.js/src/init.cjs');
const { enhanceMessageWithKurdishPrompt } = require('./features/languageFilter');
const { containsBadWords } = require('./features/badWordsFilter');
const { isKurdish, getNonKurdishResponse } = require('./features/languageDetection');
const { isAskingAboutBot, getBotInfoResponse } = require('./features/aboutBot');
const { saveChannelConfig } = require('./features/database');
const { registerSlashCommands, handleSetupInteraction } = require('./features/Commands');
const { sendSetupMessage, hasActiveThread, createUserThread } = require('./features/threadManager');
// Credits system removed — responses are free

const puter = init(process.env.PUTER_AUTH_TOKEN);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

client.on('ready', async () => {
  console.log(`✅ Karwan logged in as ${client.user.tag}`);
  try {
    await registerSlashCommands(client);
    console.log('✅ Registered slash commands');
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
});

// Handle button clicks
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {

      if (interaction.customId === 'start_chat') {
    try {
      // Defer immediately to prevent timeout
      await interaction.deferReply({ flags: 64 });

      // Check if user already has active thread
      if (hasActiveThread(interaction.user.id)) {
        await interaction.editReply({
          content: '❌ پێشتر تەوەرێکی گفتوگۆی چالاکت هەیە! تکایە ئەو یەکە بەکاربهێنە.',
        });
        return;
      }

      // Create private thread for user
      const thread = await createUserThread(interaction.user, interaction.channel);

      if (!thread) {
        await interaction.editReply({
          content: '❌ شکستی هێنا لە دروستکردنی تەوەرەی چات. دواتر هەوڵبدەرەوە!',
        });
        return;
      }

      // Send welcome message in thread
      await thread.send(
        `سڵاوچۆن دەتوانم یارمەتیت بدەم؟`
      );

      // Edit the deferred message
      await interaction.editReply({
         content: `چاتی تایبەت دروست کرا!`,
      });

      // Delete the message after 3 seconds
      setTimeout(async () => {
        try {
          await interaction.deleteReply();
        } catch (error) {
          console.log('Could not delete reply');
        }
      }, 3000);
    } catch (error) {
      console.error('Button interaction error:', error);
      await interaction.reply({
        content: '❌ هەڵەیەک ڕوویدا!',
        ephemeral: true,
      }).catch(() => {});
    }
      }
      return;
    }

    // Handle slash (chat input) commands
    if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
      if (interaction.commandName === 'setup') {
        await handleSetupInteraction(interaction);
      }
      return;
    }
  } catch (error) {
    console.error('Interaction handling error:', error);
    try { await interaction.reply({ content: '❌ An error occurred while processing interaction.', ephemeral: true }); } catch {};
  }
});

// Handle messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  

  // Only process messages in threads
  if (!message.channel.isThread()) {
    return;
  }

  try {
    await message.channel.sendTyping();

    const userMessage = message.content.trim();

    if (!userMessage) {
      return;
    }

    // Check for bad words - if found, don't answer
    if (containsBadWords(userMessage)) {
      return;
    }

    // Check if message is in Kurdish
    if (!isKurdish(userMessage)) {
      await message.channel.send(getNonKurdishResponse());
      return;
    }

    // Check if asking about the bot
    if (isAskingAboutBot(userMessage)) {
      await message.channel.send(getBotInfoResponse());
      return;
    }

    // Credits system removed — allow responses without balance checks

    // Use Puter.js AI with Kurdish language enforcement
    const enhancedMessage = enhanceMessageWithKurdishPrompt(userMessage);
    const aiResponse = await puter.ai.chat(enhancedMessage, { model: 'qwen/qwen3.6-plus' });

    // Extract text from the response structure with multiple fallbacks
    let finalResponse = '';
    
    console.log('API Response:', JSON.stringify(aiResponse, null, 2));
    
    // Try multiple response formats
    if (aiResponse?.message?.content?.[0]?.text) {
      finalResponse = aiResponse.message.content[0].text;
    } else if (aiResponse?.message?.content) {
      finalResponse = aiResponse.message.content;
    } else if (aiResponse?.message) {
      finalResponse = aiResponse.message;
    } else if (typeof aiResponse === 'string') {
      finalResponse = aiResponse;
    } else if (aiResponse?.text) {
      finalResponse = aiResponse.text;
    } else {
      console.log('Full response object:', aiResponse);
      finalResponse = 'I got an empty response. Try again! 😅';
    }

    // No credit checks — proceed to send response

    // Split response by paragraphs for better formatting
    if (finalResponse.length > 2000) {
      // Try to split by paragraph first (double newlines)
      const paragraphs = finalResponse.split(/\n\n+/);
      let currentMessage = '';
      
      for (const paragraph of paragraphs) {
        if ((currentMessage + paragraph).length > 1900) {
          if (currentMessage) {
            await message.channel.send(currentMessage.trim());
          }
          currentMessage = paragraph + '\n\n';
        } else {
          currentMessage += paragraph + '\n\n';
        }
      }
      
      if (currentMessage.trim()) {
        await message.channel.send(currentMessage.trim());
      }
    } else {
      await message.channel.send(finalResponse);
    }

    // No credit deductions
  } catch (error) {
    console.error('API Error:', error);
    await message.channel.send('Sorry, I encountered an error! 😅').catch(() => {});
  }
});

client.login(process.env.DISCORD_TOKEN);