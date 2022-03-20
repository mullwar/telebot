const { TeleBot } = require("../");
const express = require("express");

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEBOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const bot = new TeleBot(TOKEN);

bot.on("text", (msg) => bot.sendMessage(msg.chat.id, "Hello, Express!"));

bot.setWebhook(`https://YOUR_HOST/bot/${TOKEN}`);

app.post(`bot/${TOKEN}`, (request, response) => {
  bot.processTelegramUpdates([request.body]);
  response.sendStatus(200);
});

app.listen(80);
