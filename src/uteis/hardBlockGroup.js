// src/uteis/hardBlocGroup.js
// This function will exit from a group
// This will be used only once 
// Exit Group
async function hardBlockGroup(client, groupId) {
  try {
    const chat = await client.getChatById(groupId);
    await chat.leave();

    await GroupSettings.findOneAndUpdate(
      { groupId },
      { isBlocked: true, updatedAt: new Date() },
      { upsert: true },
    );

    return true;
  } catch (error) {
    console.error("Error in hard blocking group:", error);
    throw error;
  }
}

export default {
  hardBlockGroup
};
