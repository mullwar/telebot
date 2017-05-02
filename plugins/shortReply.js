/*
    Short replays for lazy people :)
*/

const SHORTCUTS = {
    text: 'sendMessage',
    photo: 'sendPhoto',
    video: 'sendVideo',
    file: 'sendDocument',
    sticker: 'sendSticker',
    audio: 'sendAudio'
};

module.exports = {

    id: 'shortReply',

    defaultConfig: {
        methodName: 'reply',
        privateMode: false,
        asReply: false
    },

    plugin(bot, cfg) {

        const methodName = cfg.methodName || 'reply';
        const isPrivate = cfg.privateMode === true;
        const asReply = cfg.asReply === true;

        function propertyProcessor(msg, props) {
            if (asReply || props.asReply === true) props.reply = msg.message_id;
            return props;
        }

        function replyObject(data) {

            const msg = data.message;
            const userId = isPrivate ? msg.from.id : msg.chat.id;

            const replyMethods = {};

            for (let name in SHORTCUTS) {
                replyMethods[name] = (data, props = {}) => {
                    return bot[SHORTCUTS[name]](userId, data, propertyProcessor(msg, props));
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