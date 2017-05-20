const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

const GAME_ID = 'YOUR_GAME_ID';
const GAME_URL = 'http://your-game-url.com';

bot.on(['/start', '/game'], (msg) => {

    // Send game with registred GAME_ID
    return bot.sendGame(msg.from.id, GAME_ID);

});


bot.on('callbackQuery', (msg) => {

    const gameId = msg.game_short_name;

    if (gameId == GAME_ID) {
        // Send game url
        return bot.answerCallbackQuery(msg.id, {url: GAME_URL});
    }

});

bot.start();
