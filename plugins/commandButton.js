/*
    Use commands in buttons.
*/

module.exports = {

    id: 'commandButton',
    defaultConfig: {
        regExpEvents: true
    },

    plugin(bot, pluginConfig) {

        const {regExpEvents} = pluginConfig;

        bot.on('callbackQuery', (msg, props) => {

            let isAnswered = false;
            let promise = Promise.resolve();

            const cmd = msg.data;

            if (cmd.charAt(0) == '/') {
                answerCallback();
                promise = bot.event(cmd, msg, props);
            }

            if (regExpEvents) {
                for (let eventName of bot.eventList.keys()) {
                    if (eventName instanceof RegExp) {
                        const match = cmd.match(eventName);
                        if (match) {
                            answerCallback();
                            props.match = match;
                            promise = promise.then(() => bot.event(eventName, msg, props));
                        }
                    }
                }
            }

            return promise;

            function answerCallback() {
                if (!isAnswered) {
                    bot.answerCallbackQuery(msg.id);
                    isAnswered = true;
                }
            }

        });

    }

};
