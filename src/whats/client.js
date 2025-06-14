// client.js

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require('qrcode');
const path = require("path");
const fs = require("fs");
const TelegramService = require('../services/TelegramService'); // Adjust path as needed

const telegramBot = new TelegramService(
  process.env.TELEGRAM_BOT_TOKEN, 
  process.env.TELEGRAM_CHAT_ID
);

async function initializeWhatsAppClient() {

  const client = new Client({
      authStrategy: new LocalAuth({
          clientId: "my-app-123", // Optional but recommended
          dataPath: "./sessions" // This will create the auth folder here
      })
  });

  client.on('qr', async (qr) => {
    console.log('WhatsApp client QR event received. Generating QR code image...');
    // Send the QR code to Telegram
    await telegramBot.sendQrCode(qr, 'New WhatsApp client QR code! Scan to link your device.');
  });

  client.on("ready", () => {
    console.log("WhatsApp client is ready!");
  });

  client.on("authenticated", () => {
    console.log("WhatsApp client authenticated");
  });

  client.on("auth_failure", (msg) => {
    console.error("WhatsApp authentication failed:", msg);
  });

  client.initialize();
  return client;
}

module.exports = { initializeWhatsAppClient };