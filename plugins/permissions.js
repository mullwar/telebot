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
    }
};
