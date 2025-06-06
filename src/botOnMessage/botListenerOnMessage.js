//src/botOnMessage/botListenerOnMessage.js
//this bot will handle incoming messages

// Change to CommonJS requires
const { hardBlockUser } = require("./blockers/hardBlockUser");
const { hardBlockGroup } = require("./blockers/hardBlockGroup");
const { softBlockUser } = require("./blockers/softBlockUser");
const { softBlockGroup } = require("./blockers/softBlockGroup");

/**
 * Main bot message listener function
 * Processes incoming WhatsApp messages and routes them appropriately
 * @param {Object} client - The initialized WhatsApp client instance.
 * @param {Object} message - WhatsApp message object.
 * @param {Object} blockedEntities - Object containing Maps of blocked groups and users.
 */
async function botListenerOnMessage(client, message, blockedEntities) {
    try {
        // Basic message info
        const messageBody = message.body.toLowerCase().trim();
        const messageType = message.type;
        const fromUser = message.from;
        const isGroup = message.from.includes('@g.us');
        const contact = await message.getContact();

        // Log incoming message for debugging
        console.log(`[BOT] New message from ${contact.name || fromUser}: ${messageBody}`);

        // Skip processing for certain message types
        if (shouldSkipMessage(message)) {
            return;
        }

        // Route message based on type and content, passing client and blockedEntities
        await routeMessage(client, message, messageBody, isGroup, fromUser, blockedEntities);

    } catch (error) {
        console.error('[BOT] Error processing message:', error);
        // Optionally send error message back to user
        // await message.reply('Sorry, I encountered an error processing your message.');
    }
}

/**
 * Determines if message should be skipped from processing
 * @param {Object} message - WhatsApp message object
 * @returns {boolean}
 */
function shouldSkipMessage(message) {
    // Skip messages from status broadcast
    if (message.broadcast) return true;

    // Skip messages that are older than 5 minutes (to avoid processing old messages on startup)
    const messageAge = Date.now() - (message.timestamp * 1000);
    if (messageAge > 5 * 60 * 1000) return true;

    // Skip if message is from self (bot)
    if (message.fromMe) return true;

    return false;
}

/**
 * Routes messages to appropriate handlers based on content and context
 * @param {Object} client - The initialized WhatsApp client instance.
 * @param {Object} message - WhatsApp message object
 * @param {string} messageBody - Cleaned message body
 * @param {boolean} isGroup - Whether message is from a group
 * @param {string} fromUser - User/group ID
 * @param {Object} blockedEntities - Object containing Maps of blocked groups and users.
 */
async function routeMessage(client, message, messageBody, isGroup, fromUser, blockedEntities) {
    // Regular message processing
    await handleRegularMessage(client, message, messageBody, isGroup, fromUser, blockedEntities);
}

/**
 * Handles regular (non-command) messages
 * Segregates between regular messages and group messages
 * @param {Object} client - The initialized WhatsApp client instance.
 * @param {Object} message - WhatsApp message object
 * @param {string} messageBody - Message content
 * @param {boolean} isGroup - Whether from group
 * @param {string} fromUser - User/group ID
 * @param {Object} blockedEntities - Object containing Maps of blocked groups and users.
 */
async function handleRegularMessage(client, message, messageBody, isGroup, fromUser, blockedEntities) {
    console.log(`[BOT] Processing regular message from ${isGroup ? 'group' : 'user'}: ${fromUser}`);

    if (isGroup) {
        console.log(`[BOT] Processing group message - applying softBlockGroup`);
        // Pass the client and the groups map from blockedEntities
        await softBlockGroup(client, message, blockedEntities.groups);
    } else {
        console.log(`[BOT] Processing direct message - applying softBlockUser`);
        // Pass the client and the users map from blockedEntities
        await softBlockUser(client, message, blockedEntities.users);
    }
}

module.exports = botListenerOnMessage;