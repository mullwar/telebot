/*
    Short replays for lazy people :)
*/

const SHORTCUTS = {
    text: 'sendMessage',
    photo: 'sendPhoto',
    video: 'sendVideo',
    file: 'sendDocument',
    sticker: 'sendSticker',
    audio: 'sendAudio',
    voice: 'sendVoice',
    action: 'sendChatAction',
    location: 'sendLocation',
    place(position, title, address, props = {}) {
        const msg = this.data.message;
        return this.bot.sendVenue(this.userId, position, title, address, this.propertyProcessor(msg, props));
    }
};

module.exports = {

    id: 'shortReply',

    defaultConfig: {
        methodName: 'reply',
        privateMode: false,
        replyMode: false
    },

    plugin(bot, cfg) {

        const methodName = cfg.methodName || 'reply';
        const isPrivate = cfg.privateMode === true;
        const replyMode = cfg.replyMode === true;

        function propertyProcessor(msg, props) {
            if (replyMode || props.asReply === true) {
                props.reply = msg.message_id;
            }
            return props;
        }

        function replyObject(data) {

            const msg = data.message;
            const userId = isPrivate ? msg.from.id : msg.chat.id;

            const replyMethods = {};

            for (let name in SHORTCUTS) {
                const fn = SHORTCUTS[name];
                if (typeof fn === 'string') {
                    replyMethods[name] = (data, props = {}) => {
                        return bot[fn](userId, data, propertyProcessor(msg, props));
                    }
                } else {
                    replyMethods[name] = fn.bind({bot, data, userId, propertyProcessor});
                }
            }

            return replyMethods;
        }

        bot.mod('message', (data) => {
            data.message[methodName] = replyObject(data);
            return data;
        });

    }

};