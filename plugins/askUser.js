/*
    Get direct answers from user.
*/

const userList = {};

module.exports = {

    id: 'askUser',

    plugin(bot) {

        // On every message
        bot.on('*', (msg, props) => {

            const id = msg.chat.id;
            const ask = userList[id];

            // If no question, then it's a regular message
            if (!ask) return;

            // Delete user from list and send custom event
            delete userList[id];
            bot.event('ask.' + ask, msg, props);

        });

        // Before call sendMessage method
        bot.on('sendMessage', (args) => {

            const id = args[0];
            const opt = args[2] || {};

            const ask = opt.ask;

            // If "ask" in options, add user to list
            if (ask) userList[id] = ask;

        });

    }
};
