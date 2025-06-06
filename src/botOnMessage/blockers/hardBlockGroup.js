// src/botOnMessage/blockers/hardBlockGroup.js
const GroupSettings = require('../../models/GroupSettings'); // Import GroupSettings for database interaction

// This function will exit from a group
// This will be used only once
// Exit Group
async function hardBlockGroup(client, groupId) {
  try {
    const chat = await client.getChatById(groupId);
    await chat.leave();

    await GroupSettings.findOneAndUpdate(
      { groupId },
      { isBlocked: true, blockType: 'hard', updatedAt: new Date() }, // Set blockType to 'hard'
      { upsert: true },
    );

    return true;
  } catch (error) {
    console.error("Error in hard blocking group:", error);
    throw error;
  }
}

// Changed to CommonJS export for consistency
module.exports = {
  hardBlockGroup
};