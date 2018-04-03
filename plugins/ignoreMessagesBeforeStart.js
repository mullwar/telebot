const startDate = {};

module.exports = {

    id: 'ignoreMessagesBeforeStart',

    defaultConfig: {
        start: true
    },

    plugin(bot, config) {

        bot.on(config.start ? ['start', '/start'] : 'start', (msg) => {
            let userId = 'main_bot';
            if (msg && msg.from) {
                userId = msg.from.id;
            }
            startDate[userId] = Date.now();
        });

        bot.mod('message', (data) => {
            const { date, from } = data.message;
            if (from && (date * 1000 < startDate[from.id] || date * 1000 < startDate.main_bot)) {
                data.message = {};
            }

            return data;
        });
    }
};
