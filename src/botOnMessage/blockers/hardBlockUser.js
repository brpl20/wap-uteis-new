// src/botOnMessage/blockers/hardBlockUser.js
const UserSettings = require('../../models/UserSettings'); // Import UserSettings for database interaction

// This function will really block an user
// This will be used only once
// HardBlock User
async function hardBlockUser(client, userId) {
  try {
    const chat = await client.getChat(userId); // getChat is appropriate for users
    await chat.block(); // Blocks the user

    await UserSettings.findOneAndUpdate(
      { userId },
      { isBlocked: true, blockType: 'hard', updatedAt: new Date() }, // Set blockType to 'hard'
      { upsert: true },
    );

    return true;
  } catch (error) {
    console.error("Error in hard blocking user:", error);
    throw error;
  }
}

// Changed to CommonJS export for consistency
module.exports = {
  hardBlockUser
};