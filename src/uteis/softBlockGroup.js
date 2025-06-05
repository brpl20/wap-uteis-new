// src/uteis/softBlock.js
// SoftBlockGroup:
// This function will be called recurrently in the app 
// To avoid certain groups
async function archiveGroup(client, message, groupsToArchive, debug = false) {
  if (
    message.from.endsWith("@g.us") &&
    groupsToArchive.has(message.from)  // Changed from includes to has
  ) {
    if (debug) {
      console.log("Group Message =>", message);
    }
    try {
      let chat = await client.getChatById(message.from);
      await chat.archive();
      if (debug) {
        console.log("Group archived:", message.from);
      }
    } catch (error) {
      console.error("Error archiving group:", error);
    }
  }
}

export default {
  archiveGroup
};
