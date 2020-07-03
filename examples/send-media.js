const { TeleBot } = require("../");

const TOKEN = process.env.TELEBOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";

const bot = new TeleBot(TOKEN);

bot.on("text", (msg) => {
    bot.sendDocument(
        msg.chat.id,
        bot.uploadFile(__dirname + "/data/telegram.png"),
        {
            caption: "Document example 🗂 *(uploaded)*",
            parse_mode: "markdown"
        }
    );

    bot.sendPhoto(
        msg.chat.id,
        "AgACAgQAAxkDAAJ35V7wzLulQ5rufl9v1X0I8-8F4EQcAAKsqjEbcEQ8Ug7IyuiDPODzj2b0Il0AAwEAAwIAA3kAA5roAQABGgQ",
        {
            caption: "Photo example 🖼 *(file_id)*",
            parse_mode: "markdown"
        }
    );

    bot.sendAudio(
        msg.chat.id,
        "https://file-examples.com/wp-content/uploads/2017/11/file_example_MP3_700KB.mp3",
        {
            caption: "Audio example 🎶 *(url)*",
            parse_mode: "markdown"
        }
    );

    bot.sendMediaGroup(msg.chat.id, [
        {
            type: "photo",
            media: bot.uploadFile(__dirname + "/data/image.jpg"),
            caption: "400 million Telegram users!"
        },
        {
            type: "photo",
            media: bot.uploadFile(__dirname + "/data/image2.jpg"),
            caption: "Video Editor, Animated Photos..."
        },
        {
            type: "photo",
            media: bot.uploadFile(__dirname + "/data/image3.jpg")
        },
        {
            type: "video",
            media: bot.uploadFile(__dirname + "/data/video.mp4")
        }
    ]);

});

bot.start();
