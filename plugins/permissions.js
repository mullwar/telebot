module.exports = {

    id: 'permissions',
    defaultConfig: {
        allowedUserIds: [],
        message: '⛔ you are not authorized'
    },

    plugin(bot, pluginConfig) {

        bot.mod('message', (data) => {
            if (data.message.chat.type === 'channel') {
                const chatId = data.message.chat.id;
                bot.sendMessage(userId, pluginConfig.message).then(() => {
                    bot.leaveChat(chatId);
                });
            } else {
                const userId = data.message.from.id;
                if (pluginConfig.allowedUserNames.includes(userId) < 0) {
                    data.message = {};
                    bot.sendMessage(userId, pluginConfig.message);
                }
            }

            return data;
        });
    }
};
