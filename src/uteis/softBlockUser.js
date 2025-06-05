// src/uteis/softBlock.js
// SoftBlock User
// This function will be called recurrently in the app 
// To avoid certain persons 
async function softBlockUser(client, message, spamToArchive, debug = false) {
  try {
    console.log(client);
    console.log(message);
    console.log(spamToArchive);
    let contact = await message.getContact();
    if (contact && spamToArchive.get(message.from) === 'soft') {
      let chat = await client.getChatById(message.from);
      await chat.archive();
      if (debug) {
        console.log("Chat archived:", message.from);
      }
    }
  } catch (error) {
    console.error("Error archiving chat:", error);
    console.error("Message from:", message.from);
  }
}

export default {
  softBlockUser,
};
