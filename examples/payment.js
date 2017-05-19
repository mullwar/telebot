const TeleBot = require('../');
const bot = new TeleBot('TELEGRAM_BOT_TOKEN');

bot.on('/start', (msg) => {

    const inlineKeyboard = bot.inlineKeyboard([
        [
            bot.inlineButton('Take all my money!', {pay: true})
        ]
    ]);

    return bot.sendInvoice(msg.from.id, {
        title: 'My Test Invoice',
        description: 'TeleBot loves payments!',
        payload: 'telebot-test-invoice',
        providerToken: 'PAYMENT_PROVIDER_TOKEN',
        startParameter: 'pay',
        currency: 'EUR',
        prices: [
            {label: 'Tea', amount: 125},
            {label: 'For testing!', amount: 1250},
            {label: 'Discount', amount: -120}
        ],
        replyMarkup: inlineKeyboard
    }).then(data => {
        console.log('OK', data);
    }).catch(error => {
        console.log('ERROR', error);
    });

});


bot.on('shippingQuery', (msg) => {
    console.log('shippingQuery', msg);
});

bot.on('preShippingQuery', (msg) => {
    console.log('preShippingQuery', msg);

    const id = msg.id;
    const isOk = true;

    return bot.answerPreCheckoutQuery(id, isOk);

});

bot.on('successfulPayment', (msg) => {
    console.log('successfulPayment', msg);

    return bot.sendMessage(msg.from.id, `Thank you, ${msg.from.first_name}!`);

});

bot.connect();
