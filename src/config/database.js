// config/database.js
const mongoose = require('mongoose');
const GroupSettings = require('../models/GroupSettings');
const UserSettings = require('../models/UserSettings'); 


async function loadBlockedEntities() {
  try {
    const blockedEntities = {
      groups: new Map(), 
      users: new Map()   
    };

    const blockedGroups = await GroupSettings.find({
      isBlocked: true,
      blockType: { $in: ['soft', 'hard'] }
    });
    blockedGroups.forEach(group => {
      blockedEntities.groups.set(group.groupId, group.blockType);
    });
    console.log(`Loaded ${blockedGroups.length} blocked groups`);

    console.log("\nCurrently Blocked Groups:");
    for (const group of blockedGroups) {
      console.log(`- ${group.groupId}: ${group.blockType} (${group.description || 'No description'})`);
    }

    const blockedUsers = await UserSettings.find({
      isBlocked: true,
      blockType: { $in: ['soft', 'hard'] }
    });
    blockedUsers.forEach(user => {
      blockedEntities.users.set(user.userId, user.blockType);
    });
    console.log(`Loaded ${blockedUsers.length} blocked users`);

    console.log("\nCurrently Blocked Users:");
    for (const user of blockedUsers) {
      console.log(`- ${user.userId}: ${user.blockType} (${user.description || 'No description'})`);
    }
    // --------------------------------------------------------

    return blockedEntities;
  } catch (error) {
    console.error("Error loading blocked entities:", error);
    throw error;
  }
}

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  loadBlockedEntities
};