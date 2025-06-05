require("dotenv").config();
const { initializeWhatsAppClient } = require("./whats/client");
const { connectDatabase, loadBlockedEntities } = require("./config/database");

const botListener = require('./bot/botListenerOnMessage');  

let listenerGroupId = null;

async function startApplication() {
  try {
    console.log("Starting application...");

    // Initialize MongoDB connection
    console.log("Connecting to database...");
    await connectDatabase();
    await loadBlockedEntities(loadBlockedEntities);
    console.log("Database connected successfully");

    // Initialize WhatsApp client
    console.log("Initializing WhatsApp client...");
    const client = await initializeWhatsAppClient();
    console.log("WhatsApp client initialized");
    await waitForClientReady(client);

    // Create Message handler with blocking logic
    // client.on("message_create", async (message) => {}
     

    // Message handler with blocking logic
    client.on('message', async (message) => {
        try {
            await botListener(message);
        } catch (error) {
            console.error('❌ Error in message handler:', error);
        }
    });
}   catch (error) {
    console.error("Erro de inicialização:", error);
    }
};


async function cleanup() {
  try {
    if (typeof mongoose !== 'undefined') {
      mongoose.disconnect().catch(console.error);
    }
    console.log("Cleaning up...");
    await mongoose.connection.close();
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