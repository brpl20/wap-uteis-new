// src/botOnMessage/blockers/softBlockUser.js
// SoftBlock User
// This function will be called recurrently in the app
// To avoid certain persons
async function softBlockUser(client, message, blockedUsersMap, debug = false) {
  try {
    // These console.logs are for debugging. Consider removing or making them conditional on `debug`
    // console.log(client);
    // console.log(message);
    // console.log(blockedUsersMap);

    let contact = await message.getContact(); // Ensure contact is retrieved
    const userId = message.from;

    if (contact && blockedUsersMap.has(userId) && blockedUsersMap.get(userId) === 'soft') {
      let chat = await client.getChatById(userId); // getChatById is appropriate for both users and groups
      await chat.archive();
      if (debug) {
        console.log("Chat archived:", userId);
      }
    }
  } catch (error) {
    console.error("Error archiving chat:", error);
    console.error("Message from:", message.from);
  }
}

// Changed to CommonJS export for consistency
module.exports = {
  softBlockUser,
};