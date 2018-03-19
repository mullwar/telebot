/*
    Simple flood protection plugin.
    Note: Received Telegram message time accuracy is one second.
*/

const userList = {};

// Export bot module
module.exports = {

    id: 'floodProtection',
    defaultConfig: {
        interval: 1,
        message: 'Too many messages, relax!'
    },

    plugin(bot, pluginConfig) {

        const interval = Number(pluginConfig.interval) || 1;
        const text = pluginConfig.message;

        bot.mod('message', (data) => {

            const msg = data.message;
            const id = msg.from.id;
            const user = userList[id];
            const now = new Date(msg.date);

            if (user) {

                const diff = now - user.lastTime;
                user.lastTime = now;

                if (diff <= interval) {

                    if (!user.flood) {
                        if (text) bot.sendMessage(id, text);
                        user.flood = true;
                    }

                    data.message = {};

                } else {
                    user.flood = false;
                }

            } else {
                userList[id] = {lastTime: now};
            }

            return data;

        });

    }
};
