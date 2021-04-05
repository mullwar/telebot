const { TeleBot } = require("../");

const TOKEN = process.env.TELEBOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";

const bot = new TeleBot(TOKEN);

function readableDate(date) {
    return new Date(date * 1000)
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
}

bot.on("text", (msg) => {
    return bot.sendMessage(
        msg.chat.id,
        `🗣 <b>${msg.text}</b>\n\n🕓 <i>${readableDate(msg.date)}</i>`,
        {
            parse_mode: "html"
        }
    );
});

bot.start().then(() => {
    console.log("Bot started");
});
