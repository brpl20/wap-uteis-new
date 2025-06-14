// src/services/TelegramService.js
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode'); // Import the qrcode library

class TelegramService {
    constructor(token, chatId) {
        if (!token || !chatId) {
            console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set. Telegram features will be disabled.");
            this.bot = null;
            this.chatId = null;
        } else {
            this.bot = new TelegramBot(token, { polling: false });
            this.chatId = chatId;
            console.log("Telegram bot initialized.");

            this.bot.on('polling_error', (error) => {
                console.error("Telegram polling error:", error);
            });
            this.bot.on('webhook_error', (error) => {
                console.error("Telegram webhook error:", error);
            });
        }
    }

    _logErrorDetails(error) {
        console.error("  --- BEGIN ERROR DETAILS ---");
        if (error && error.name === 'AggregateError' && error.errors && Array.isArray(error.errors)) {
            console.error("  AggregateError contains multiple errors:");
            error.errors.forEach((e, index) => {
                console.error(`    [${index + 1}] Type: ${e.name || 'Unknown'}, Message: ${e.message || 'No message'}`);
                if (e.code) console.error(`      Code: ${e.code}`);
                if (e.response && e.response.body) {
                    console.error(`      Telegram API Response (sub-error): ${JSON.stringify(e.response.body)}`);
                }
            });
        } else if (error && error.response && error.response.body) {
            console.error("  Telegram API Response (Non-AggregateError):", JSON.stringify(error.response.body));
        } else {
            console.error("  Full Error Object:", error);
        }
        console.error("  --- END ERROR DETAILS ---");
    }

    async sendMessage(message) {
        if (!this.bot) {
            console.warn("Telegram bot not initialized. Cannot send message.");
            return;
        }
        try {
            await this.bot.sendMessage(this.chatId, message);
            console.log("Telegram message sent successfully.");
        } catch (error) {
            console.error("Error sending Telegram message:", error.message);
            this._logErrorDetails(error);
        }
    }

    /**
     * Sends a QR code image to the configured Telegram chat.
     * @param {string} qrData The data to encode in the QR code (the QR string from the WhatsApp client).
     * @param {string} caption Optional caption for the image.
     */
    async sendQrCode(qrData, caption = 'Scan this QR code to connect your WhatsApp client:') {
        if (!this.bot) {
            console.warn("Telegram bot not initialized. Cannot send QR code.");
            return;
        }
        try {
            const fs = require('fs');
            const path = require('path');
            const tempFilePath = path.join(__dirname, '../temp', `qr-${Date.now()}.png`);
            
            // Ensure temp directory exists
            const tempDir = path.dirname(tempFilePath);
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            
            // Generate QR code as a file
            await qrcode.toFile(tempFilePath, qrData, {
                errorCorrectionLevel: 'H',
                margin: 1,
                scale: 8
            });
            
            // Send the file to Telegram
            await this.bot.sendPhoto(this.chatId, tempFilePath, { caption: caption });
            console.log("QR Code sent to Telegram successfully.");
            
            // Clean up the temporary file
            fs.unlinkSync(tempFilePath);
        } catch (error) {
            console.error("Error sending QR code to Telegram:", error.message);
            this._logErrorDetails(error);
        }
    }
    }



module.exports = TelegramService;