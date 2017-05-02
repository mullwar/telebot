const TeleBot = require('../');

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['askUser']
});

// On start command
bot.on('/start', msg => {

    const id = msg.from.id;

    // Ask user name
    return bot.sendMessage(id, 'What is your name?', {ask: 'name'});

});

// Ask name event
bot.on('ask.name', msg => {

    const id = msg.from.id;
    const name = msg.text;

    // Ask user age
    return bot.sendMessage(id, `Nice to meet you, ${ name }! How old are you?`, {ask: 'age'});

});

// Ask age event
bot.on('ask.age', msg => {

    const id = msg.from.id;
    const age = Number(msg.text);

    if (!age) {

        // If incorrect age, ask again
        return bot.sendMessage(id, 'Incorrect age. Please, try again!', {ask: 'age'});

    } else {

        // Last message (don't ask)
        return bot.sendMessage(id, `You are ${ age } years old. Great!`);

    }

});

bot.start();
