// src/services/TelegramService.js
const TelegramBot = require('node-telegram-bot-api');
const qrcode = require('qrcode');

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
        } catch (error) {
            console.error("Error sending Telegram message:", error.message);
            this._logErrorDetails(error);
        }
    }

    async sendQrCode(qrData) {
        if (!this.bot) {
            console.warn("Telegram bot not initialized. Cannot send QR code.");
            throw new Error("Telegram bot not available.");
        }
        if (!qrData) {
            console.warn("No QR data provided to sendQrCode. Skipping QR image sending.");
            throw new Error("QR data is empty.");
        }

        let qrBuffer;
        try {
            qrBuffer = await qrcode.toBuffer(qrData, { scale: 8 });
        } catch (qrError) {
            console.error("Error generating QR code buffer:", qrError.message);
            this._logErrorDetails(qrError);
            await this.sendMessage(`🚨 Error generating QR code image: ${qrError.message.substring(0, 100)}...`);
            throw qrError;
        }

        try {
            await this.bot.sendPhoto(this.chatId, qrBuffer, {
                caption: '🚨 WhatsApp QR Code - Please scan within 60 seconds! 🚨\nIf you don\'t see the QR, zoom in or try reloading.',
                fileOptions: {
                    filename: 'whatsapp_qr_code.png'
                }
            });
        } catch (error) {
            console.error("Error sending Telegram QR code image:", error.message);
            this._logErrorDetails(error);
            await this.sendMessage(`🚨 Error sending QR code image via Telegram: ${error.message.substring(0, 100)}...`);
            throw error;
        }
    }
}

module.exports = TelegramService;