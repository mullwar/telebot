var startDate;

module.exports = {

    id: 'ignoreMessagesBeforeStart',

    plugin(bot) {

        bot.on(['start', '/start'], () => {
            startDate = Date.now();
        });

        bot.mod('message', (data) => {
            if (data.message.date*1000 < startDate) {
                data.message = {};
            }

            return data;
        });
    }
};
