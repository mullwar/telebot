module.exports = {

    id: 'permissions',
    defaultConfig: {
        allowedUserIds: [],
        allowedChannels: [],
        message: '⛔ you are not authorized'
    },

    plugin(bot, pluginConfig) {

        bot.mod('message', (data) => {
            if (data.message.chat) {
                if (data.message.chat.type === 'channel') {
                    const chatId = data.message.chat.id;
                    if (!pluginConfig.allowedChannels.includes(chatId)) {
                        data.message = {};
                        bot.sendMessage(chatId, pluginConfig.message);
                    }
                } else {
                    const userId = data.message.from.id;
                    if (!pluginConfig.allowedUserIds.includes(userId)) {
                        data.message = {};
                        bot.sendMessage(userId, pluginConfig.message);
                    }
                }
            }

            return data;
        });
    }
};
