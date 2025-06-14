//src/botOnMessageCreate/botListenerOnMessageCreate.js
//this bot will handle out messages (created by whatsappOwner)

const { hardBlockUser } = require("../botOnMessage/blockers/hardBlockUser");
const { hardBlockGroup } = require("../botOnMessage/blockers/hardBlockGroup");
const GroupSettings = require("../models/GroupSettings"); // To update database for soft block
const UserSettings = require("../models/UserSettings"); // To update database for soft block


/**
 * Listener for messages created by the bot's owner.
 * This function processes commands like sb!, sf!, hb! for blocking entities.
 * @param {Object} client - The initialized WhatsApp client instance.
 * @param {Object} message - WhatsApp message object.
 * @param {Object} blockedEntities - Object containing Maps of blocked groups and users.
 */
async function botListenerOnMessageCreate(client, message, blockedEntities) {
    const messageBody = message.body.toLowerCase().trim();
    const chat = await message.getChat();
    const isGroup = chat.isGroup;
    const targetId = chat.id._serialized; // The ID of the chat/group where the message was sent

    console.log(`[OWNER COMMAND] New command from me: ${messageBody} in chat: ${targetId} (isGroup: ${isGroup})`);

    try {
        switch (messageBody) {
            case 'sb!': // Soft block
                if (isGroup) {
                    console.log(`[OWNER COMMAND] Soft blocking group: ${targetId}`);
                    await handleSoftBlockGroupCommand(client, targetId, blockedEntities.groups);
                    await message.reply('Grupo soft-bloqueado (arquivado).');
                } else {
                    console.log(`[OWNER COMMAND] Soft blocking contact: ${targetId}`);
                    await handleSoftBlockUserCommand(client, targetId, blockedEntities.users);
                    await message.reply('Contato soft-bloqueado (arquivado).');
                }
                break;

            case 'hb!': // Hard block
                if (isGroup) {
                    console.log(`[OWNER COMMAND] Hard blocking group (leaving): ${targetId}`);
                    await hardBlockGroup(client, targetId);
                    await message.reply('Grupo hard-bloqueado (saí do grupo).');
                    // After leaving, remove from the blockedEntities map if it was there
                    if (blockedEntities.groups.has(targetId)) {
                        blockedEntities.groups.delete(targetId);
                    }
                } else {
                    console.log(`[OWNER COMMAND] Hard blocking contact: ${targetId}`);
                    await hardBlockUser(client, targetId);
                    await message.reply('Contato hard-bloqueado.');
                    // After blocking, remove from the blockedEntities map if it was there
                    if (blockedEntities.users.has(targetId)) {
                        blockedEntities.users.delete(targetId);
                    }
                }
                break;

            case 'status!': // Health check command
                console.log(`[OWNER COMMAND] Checking bot status.`);
                let botState = await client.getState();
                let statusMessage = `*Status do Bot:*\nEstado: \`${botState || 'DESCONHECIDO'}\``;

                // Opcional: Adicionar mais informações de saúde aqui
                // Ex: verificar conexão com o banco de dados (se você tiver uma função para isso)
                // const isDbConnected = mongoose.connection.readyState === 1;
                // statusMessage += `\nBanco de Dados: ${isDbConnected ? 'Conectado' : 'Desconectado'}`;

                await message.reply(statusMessage);
                console.log(`[OWNER COMMAND] Bot status replied: ${botState}`);
                break;

            default:
                // No action for other messages from self
                // console.log(`[OWNER COMMAND] No action for message: ${messageBody}`);
                break;
        }
    } catch (error) {
        console.error(`[OWNER COMMAND] Error processing command '${messageBody}':`, error);
        await message.reply(`Error processing your command: ${error.message}`);
    }
}

/**
 * Handles soft-blocking a group from a command.
 * Updates the database and the in-memory map.
 * @param {Object} client - The WhatsApp client.
 * @param {string} groupId - The ID of the group to soft block.
 * @param {Map<string, string>} blockedGroupsMap - The in-memory map of blocked groups.
 */
async function handleSoftBlockGroupCommand(client, groupId, blockedGroupsMap) {
    // Update the database
    await GroupSettings.findOneAndUpdate(
        { groupId: groupId },
        { isBlocked: true, blockType: 'soft', updatedAt: new Date() },
        { upsert: true, new: true } // upsert creates if not exists, new returns the modified document
    );
    // Update the in-memory map
    blockedGroupsMap.set(groupId, 'soft');

    // Archive the chat immediately for user feedback
    try {
        const chat = await client.getChatById(groupId);
        await chat.archive();
        console.log(`Group ${groupId} archived by command.`);
    } catch (archiveError) {
        console.error(`Error archiving group ${groupId} after soft block command:`, archiveError);
    }
}

/**
 * Handles soft-blocking a user from a command.
 * Updates the database and the in-memory map.
 * @param {Object} client - The WhatsApp client.
 * @param {string} userId - The ID of the user to soft block.
 * @param {Map<string, string>} blockedUsersMap - The in-memory map of blocked users.
 */
async function handleSoftBlockUserCommand(client, userId, blockedUsersMap) {
    // Update the database
    await UserSettings.findOneAndUpdate(
        { userId: userId },
        { isBlocked: true, blockType: 'soft', updatedAt: new Date() },
        { upsert: true, new: true }
    );
    // Update the in-memory map
    blockedUsersMap.set(userId, 'soft');

    // Archive the chat immediately for user feedback
    try {
        const chat = await client.getChatById(userId);
        await chat.archive();
        console.log(`User chat ${userId} archived by command.`);
    } catch (archiveError) {
        console.error(`Error archiving user chat ${userId} after soft block command:`, archiveError);
    }
}


module.exports = botListenerOnMessageCreate;