// client.js

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const fs = require("fs");

async function initializeWhatsAppClient() {

  // const client = new Client({
  //   authStrategy: new LocalAuth({
  //     clientId: "whatsapp-bot", // Add a unique client ID
  //     dataPath: "/home/brpl/code/br"
  //   }),
  //   puppeteer: {
  //     args: ["--no-sandbox"],
  //   },
  // });

  // Make sure you're using LocalAuth
  const client = new Client({
      authStrategy: new LocalAuth({
          clientId: "my-app-123", // Optional but recommended
          dataPath: "./sessions" // This will create the auth folder here
      })
  });

  client.on("qr", (qr) => {
    console.log("Scan this QR code:");
    qrcode.generate(qr, { small: true });
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