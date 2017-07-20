const TeleBot = require('../');

/*

    Note: This plugin depends on askUser plugin to work.

 */

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['askUser', 'replyKeyboard'],
    pluginConfig: {
        replyKeyboard: {
            cancelLabel: '🚪 Cancel',
            logDeleteErrors: false,
            labelsPerRow: 2
        }
    }
});

let counter = 0;

function sendKeyboard(msg) {

    msg.replyKeyboard('Counter is: ' + counter, {
        labels: [
            {
                text: '➕ Counter',
                call: (replyMsg) => {
                    counter++;
                    sendKeyboard(replyMsg);
                }
            },
            {
                text: '➖ Counter',
                call: (replyMsg) => {
                    counter--;
                    sendKeyboard(replyMsg);
                }
            }
        ],
        onCancel: (replyMsg) => {
            replyMsg.reply.text('Type /start to show the keyboard again').catch(console.error);
        },
        onUnknown: (replyMsg) => {
            replyMsg.reply.text('⛔️ Unknown action!\nType /start to start again').catch(console.error);
        }
    });

}

bot.on('/start', msg => {
    sendKeyboard(msg);
});

bot.start();
