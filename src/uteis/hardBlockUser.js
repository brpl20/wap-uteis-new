// src/uteis/hardBlockUser.js
// This function will really block an user
// This will be used only once 
// HardBlock User
async function hardBlockUser(client, userId) {
  try {
    const chat = await client.getChat(userId);
    await chat.block();

    await UserSettings.findOneAndUpdate(
      { userId },
      { isBlocked: true, updatedAt: new Date() },
      { upsert: true },
    );

    return true;
  } catch (error) {
    console.error("Error in hard blocking user:", error);
    throw error;
  }
}

export default {
  hardBlockUser
};
