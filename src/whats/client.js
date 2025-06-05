// client.js

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

async function initializeWhatsAppClient() {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });

  client.on("qr", (qr) => {
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

  await client.initialize();
  return client;
}

module.exports = { initializeWhatsAppClient };
