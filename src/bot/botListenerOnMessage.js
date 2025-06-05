//src/bot/botListener.js
const { hardBlockUser } = require("./uteis/hardBlockUser").default;
const { hardBlockGroup } = require("./uteis/hardBlockGroup").default;
const { softBlockUser } = require("./uteis/softBlockUser").default;
const { softBlockGroup } = require("./uteis/softBlockGroup").default;

/**
 * Main bot message listener function
 * Processes incoming WhatsApp messages and routes them appropriately
 * @param {Object} message - WhatsApp message object
 */
async function botListenerOnMessage(message) {
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
        
        // Route message based on type and content
        await routeMessage(message, messageBody, isGroup, fromUser);
        
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
 * @param {Object} message - WhatsApp message object
 * @param {string} messageBody - Cleaned message body
 * @param {boolean} isGroup - Whether message is from a group
 * @param {string} fromUser - User/group ID
 */
async function routeMessage(message, messageBody, isGroup, fromUser) {
    // Regular message processing
    await handleRegularMessage(message, messageBody, isGroup, fromUser);
}

/**
 * Handles regular (non-command) messages
 * Segregates between regular messages and group messages
 * @param {Object} message - WhatsApp message object
 * @param {string} messageBody - Message content
 * @param {boolean} isGroup - Whether from group
 * @param {string} fromUser - User/group ID
 */
async function handleRegularMessage(message, messageBody, isGroup, fromUser) {
    console.log(`[BOT] Processing regular message from ${isGroup ? 'group' : 'user'}: ${fromUser}`);
    
    if (isGroup) {
        // Handle group messages
        console.log(`[BOT] Processing group message - applying softBlockGroup`);
        await softBlockGroup(fromUser, message);
    } else {
        // Handle direct/regular messages
        console.log(`[BOT] Processing direct message - applying softBlockUser`);
        await softBlockUser(fromUser, message);
    }
}

module.exports = botListenerOnMessage;