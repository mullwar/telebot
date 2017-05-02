/*
    Advanced analytics for your Telegram bot - http://botan.io
    Requires "botanio" npm package.
*/

module.exports = {

    id: 'botan',
    defaultConfig: null,

    plugin(bot, config) {

        // Check AppMetrika key
        const token = config;

        if (token) {

            // Require botanio
            const botan = require('botanio')(token);

            // Track every type of message
            bot.on('*', (msg, props) => botan.track(msg, props.type));

        } else {
            console.error('[botan] no token key');
        }

    }

};
