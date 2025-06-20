require("dotenv").config();
const { initializeWhatsAppClient } = require("./whats/client");
const { connectDatabase, loadBlockedEntities } = require("./config/database");

const botListenerOnMessage = require('./botOnMessage/botListenerOnMessage');
const botListenerOnMessageCreate = require('./botOnMessageCreate/botListenerOnMessageCreate'); // Import the new listener

async function waitForClientReady(client) {
  return new Promise((resolve) => {
      client.on("ready", () => {
        console.log("WhatsApp client authenticated");
        console.log("WhatsApp client is ready!");
        resolve();
      });
  });
}

async function startApplication() {
  try {
    console.log("Connecting to database...");
    await connectDatabase();
    console.log("Database connected successfully");

    console.log("Loading blocked entities...");
    const blockedEntities = await loadBlockedEntities();
    console.log("Blocked entities loaded successfully.");

    console.log("Starting application...");
    const client = await initializeWhatsAppClient();
    console.log("WhatsApp client initialized");
    await waitForClientReady(client);

    client.on('message', async (message) => {
        try {
            // Pass the client and the loaded blockedEntities to the bot listener
            console.log(message)
            await botListenerOnMessage(client, message, blockedEntities);
        } catch (error) {
            console.error('❌ Error in message handler:', error);
        }
    });

    // New listener for messages created by the bot (owner)
    client.on('message_create', async (message) => {
        try {
            // Only process messages sent by "me" (the bot's owner)
            if (message.fromMe) {
                await botListenerOnMessageCreate(client, message, blockedEntities);
            }
        } catch (error) {
            console.error('❌ Error in message_create handler:', error);
        }
    });

    // Handle process termination
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      await cleanup();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("SIGINT received. Shutting down gracefully...");
      await cleanup();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

const mongoose = require('mongoose'); // Explicitly require mongoose for cleanup function

async function cleanup() {
  try {
    // Check if mongoose is defined and connected before trying to disconnect
    if (typeof mongoose !== 'undefined' && mongoose.connection.readyState === 1) {
      await mongoose.disconnect().catch(console.error);
    }
    console.log("Cleaning up...");
    // await mongoose.connection.close(); // Generally disconnect() is sufficient
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  cleanup().then(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  cleanup().then(() => process.exit(1));
});

startApplication();