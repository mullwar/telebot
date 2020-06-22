import { TeleBot } from "../../src";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: express library required (yarn add express @types/express OR npm install express @types/express)
import { Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEBOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";

const bot = new TeleBot(TOKEN);
const secretWebhookPath = `/bot/${TOKEN}`;

bot.on("text", (msg) => bot.sendMessage(msg.chat.id, "Hello, Express!"));

bot.setWebhook(`https://YOUR_HOST/${secretWebhookPath}`);

app.post(secretWebhookPath, (request: Request, response: Response) => {
    bot.processTelegramUpdates([request.body]);
    response.sendStatus(200);
});


app.listen(80);
