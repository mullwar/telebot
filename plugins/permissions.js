var startDate;

module.exports = {

    id: 'permissions',
    defaultConfig: {
        allowedUserNames: [],
        message: '⛔ you are not authorized'
    },

    plugin(bot, pluginConfig) {

        bot.mod('message', (data) => {
            const userId = data.message.from.id;
            if (pluginConfig.allowedUserNames.indexOf(data.message.from.username) < 0) {
                data.message = {};
                bot.sendMessage(userId, pluginConfig.message);
            }

            return data;
        });

        bot.on('start', () => {
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
