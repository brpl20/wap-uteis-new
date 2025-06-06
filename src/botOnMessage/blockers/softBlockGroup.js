// src/botOnMessage/blockers/softBlockGroup.js
// SoftBlockGroup:
// This function will be called recurrently in the app
// To avoid certain groups
async function softBlockGroup(client, message, blockedGroupsMap, debug = false) {
  if (
    message.from.endsWith("@g.us") &&
    blockedGroupsMap.has(message.from) &&
    blockedGroupsMap.get(message.from) === 'soft' // Only archive if explicitly 'soft' blocked
  ) {
    if (debug) {
      console.log("Group Message =>", message);
      console.log(`Attempting to archive group: ${message.from}. Block type: ${blockedGroupsMap.get(message.from)}`);
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

// Changed to CommonJS export for consistency
module.exports = {
  softBlockGroup
};