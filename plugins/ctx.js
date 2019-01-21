/*
	Pass data to next user reply
*/


const userList = {};

module.exports = {
    id: 'ctx',
    defaultConfig: {},
    plugin(bot) {

        // On every message
        bot.mod('message', (data) => {
            let msg = data.message;

            const id = msg.chat.id;
            const ctx = userList[id];
            
            // If no ctx, then return the message
            if (!ctx) return data;

            // If ctx deletit from the list and add it to the message
            delete userList[id];
            msg.ctx = ctx;
            return data;
        });

        // Before call sendMessage method
        bot.on('sendMessage', (args) => {
            const id = args[0];
            const opt = args[2] || {};

            const ctx = opt.ctx;

            if (ctx) userList[id] = ctx;
        });

    }
}