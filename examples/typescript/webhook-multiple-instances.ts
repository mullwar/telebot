import { TeleBot } from "../../src";
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore: express library required (yarn add express @types/express OR npm install express @types/express)
import { Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");

const app = express();
app.use(express.json());

const BOT1_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_1";
const BOT2_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_2";

const bot1 = new TeleBot(BOT1_TOKEN);
const bot2 = new TeleBot(BOT2_TOKEN);

bot1.on("text", (msg) => bot1.sendMessage(msg.chat.id, "BOT-1"));
bot2.on("text", (msg) => bot2.sendMessage(msg.chat.id, "BOT-2"));

bot1.setWebhook(`https://YOUR_HOST/bot1/${BOT1_TOKEN}`);
bot2.setWebhook(`https://YOUR_HOST/bot2/${BOT2_TOKEN}`);

app.post(`/bot1/${BOT1_TOKEN}`, (request: Request, response: Response) => {
    bot1.processTelegramUpdates([request.body]);
    response.sendStatus(200);
});

app.post(`/bot2/${BOT1_TOKEN}`, (request: Request, response: Response) => {
    bot2.processTelegramUpdates([request.body]);
    response.sendStatus(200);
});

app.listen(80);
