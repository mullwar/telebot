/*
    Reports events (and their data) to user list.

    Additional action method properties:
    {
        skipReport: true // Skips report
    }
*/

module.exports = {

    id: 'reporter',

    defaultConfig: {
        events: [],
        to: []
    },

    plugin(bot, pluginConfig) {

        // If no module options
        if (typeof pluginConfig != 'object') {
            return console.error('[report] no config data');
        }

        // Get lists
        let toList = Array.isArray(pluginConfig.to) ? pluginConfig.to : [];
        let eventList = Array.isArray(pluginConfig.events) ? pluginConfig.events : [];

        // Check lists
        if (!toList.length) return console.error('[report] no user list');
        if (!eventList.length) return console.error('[report] no event list');

        // Create events handler
        bot.on(eventList, (event = {}, props, info) => {

            // Skip event with "skipReport: true" option key
            if (
                Object.prototype.toString.call(event) == '[object Arguments]' &&
                (Array.prototype.slice.call(event).slice(-1)[0]).skipReport === true
            ) return;

            const type = info.type;
            const prefix = type.split('.')[0];

            // Stringify object data
            const jsonData = s(JSON.stringify(event, (k, v) => {
                return v.value instanceof Buffer ? '[Buffer]' : v;
            }));


            // Send to every user in list
            for (let userId of toList) {

                if (prefix == 'error') {

                    // Error event
                    const {data, error} = event;

                    bot.sendMessage(userId,
                        `👤 <b>User:</b> ${ data.from.id } (${ data.chat.id })\n` +
                        `⚠ <b>Error:</b> ${ error.message || error }\n` +
                        `${ error.stack ? `🚧 <b>Stack:</b>\n${ s(error.stack) }\n` : '' }` +
                        `⏰ <b>Event:</b> ${ type }\n` +
                        `💾 <b>Data:</b> ${ jsonData }`,
                        {parseMode: 'html', skipReport: true}
                    );

                } else {

                    // Another type of event
                    bot.sendMessage(userId,
                        `⏰ <b>Event:</b> ${ type }\n` +
                        (jsonData && jsonData != '{}' ? `💾 <b>Data:</b> ${ jsonData }` : ''),
                        {parseMode: 'html', skipReport: true}
                    );

                }

            }

        });

    }

};

// Safe string function
function s(str) {
    return String(str).replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
