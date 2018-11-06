/*
    Named buttons which triggers bot commands.
*/

module.exports = {

    id: 'namedButtons',
    defaultConfig: {
        buttons: {
            // myButton: {
            //     label: '😄 My Button Name',
            //     command: '/myBotCommand',
            //     cb: _=> { console.log("Event My Button"); }
            // }
        }
    },

    plugin(bot, pluginConfig) {

        const buttons = pluginConfig.buttons || {};

        bot.on('text', (msg, props) => {
            const text = msg.text;
            for (let buttonId in buttons) {
                const button = buttons[buttonId];
                if (button.label === text) {
                    if(typeof button.cb === "function")
                        button.cb(msg);
                    return bot.event(button.command, msg, props);
                }
            }

        });

    }

};
