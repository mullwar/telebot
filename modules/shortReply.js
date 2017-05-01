/*
    Module Options: {
        methodName: 'reply',
        privateMode: false,
        asReply: false
    }
*/

const ID = 'shortReply';
const SHORTCUTS = {
    text: 'sendMessage',
    photo: 'sendPhoto',
    video: 'sendVideo',
    file: 'sendDocument',
    sticker: 'sendScticker',
    audio: 'sendAudio'
};

module.exports = (bot, config) => {

    const cfg = config[ID] || {};
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
            replyMethods[name] = (data, props={}) => {
                return bot[SHORTCUTS[name]](userId, data, propertyProcessor(msg, props));
            }
        }

        return replyMethods;
    }

    bot.mod('message', (data) => {
        data.message[methodName] = replyObject(data);
        return data;
    });

};