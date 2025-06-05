// config/database.js
const mongoose = require('mongoose');
const GroupSettings = require('../models/GroupSettings');

async function loadBlockedEntities(blockedEntities) {
  try {
    // Load blocked groups
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