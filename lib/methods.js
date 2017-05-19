const fs = require('fs');
const nurl = require('url');
const path = require('path');
const stream = require('stream');
const request = require('request');

const ANSWER_METHODS = {
    addArticle: 'article', addPhoto: 'photo', addVideo: 'video',
    addGif: 'gif', addVideoGif: 'mpeg4_gif', addSticker: 'sticker',
    addVoice: 'voice', addDocument: 'document', addLocation: 'location',
    addVenue: 'venue', addGame: 'game',
    // Cached methods
    cachedPhoto: 'photo', cachedGif: 'gif', cachedVideoGif: 'mpeg4_gif',
    cachedSticker: 'sticker', cachedDocument: 'document', cachedVideo: 'video',
    cachedVoice: 'voice', cachedAudio: 'audio'
};

const DEFAULT_FILE_EXTS = {
    photo: 'jpg', audio: 'mp3', document: 'doc',
    sticker: 'webp', voice: 'm4a', video: 'mp4'
};

const reURL = /^https?\:\/\/|www\./;

// Methods
const methods = {

    keyboard(keyboard, opt = {}) {
        const markup = {keyboard};
        if (opt.resize === true) markup['resize_keyboard'] = true;
        if (opt.once === true) markup['one_time_keyboard'] = true;
        if (opt.selective) markup['selective'] = opt.selective;
        return markup;
    },

    button(type, text) {
        if (!text && type) return {text: type};
        type = `request_${type}`;
        return {text, [type]: true};
    },

    inlineKeyboard(inline_keyboard) {
        return {inline_keyboard};
    },

    inlineQueryKeyboard(inline_keyboard) {
        return {inline_keyboard: inline_keyboard};
    },

    inlineButton(text, opt = {}) {
        const markup = {text};
        if (opt.url) markup.url = opt.url;
        if (opt.inline !== undefined) markup.switch_inline_query = opt.inline;
        if (opt.inlineCurrent !== undefined) markup.switch_inline_query_current_chat = opt.inlineCurrent;
        if (opt.callback) markup.callback_data = String(opt.callback);
        if (opt.game) markup.callback_game = String(opt.game);
        if (opt.pay === true) markup.pay = opt.pay;
        return markup;
    },

    answerList(id, opt) {
        return new AnswerList(id, opt);
    },

    getMe: {
        then: data => data.result
    },

    sendMessage: {
        arguments: ['chat_id', 'text']
    },

    forwardMessage: {
        arguments: ['chat_id', 'from_chat_id', 'message_id']
    },

    sendPhoto(id, photo, opt) {
        return sendFile.call(this, 'photo', id, photo, opt);
    },

    sendAudio(id, audio, opt = {}) {
        const form = {};

        if (opt.title) form.title = opt.title;
        if (opt.performer) form.performer = opt.performer;
        if (Number.isInteger(opt.duration)) form.duration = opt.duration;

        return sendFile.call(this, 'audio', id, audio, opt, form);
    },

    sendDocument(id, doc, opt) {
        return sendFile.call(this, 'document', id, doc, opt);
    },

    sendSticker(id, sticker, opt) {
        return sendFile.call(this, 'sticker', id, sticker, opt);
    },

    sendVideo(id, video, opt = {}) {
        const form = {};

        if (Number.isInteger(opt.duration)) form.duration = opt.duration;
        if (Number.isInteger(opt.width)) form.width = opt.width;
        if (Number.isInteger(opt.height)) form.height = opt.height;

        return sendFile.call(this, 'video', id, video, opt, form);
    },

    sendVideoNote: {
        arguments: ['chat_id', 'video_note'],
        options(form, opt) {
            if (Number.isInteger(opt.duration)) form.duration = opt.duration;
            if (Number.isInteger(opt.length)) form.length = opt.length;
            return form;
        }
    },

    sendVoice(id, voice, opt = {}) {
        const form = {};

        if (Number.isInteger(opt.duration)) form.duration = opt.duration;

        return sendFile.call(this, 'voice', id, voice, opt, form);
    },

    sendLocation: {
        arguments: (chat_id, position) => {
            return {
                chat_id, latitude: position[0], longitude: position[1]
            };
        }
    },

    sendVenue: {
        arguments: (chat_id, position, title, address) => {
            return {
                chat_id, latitude: position[0], longitude: position[1], title, address
            };
        },
        options: (form, opt) => {
            if (opt.foursquareId) form.foursquare_id = opt.foursquareId;
            return form;
        }
    },

    sendContact: {
        arguments: ['chat_id', 'phone_number', 'first_name', 'last_name']
    },

    sendChatAction: {
        short: 'sendAction',
        arguments: ['chat_id', 'action']
    },

    getUserProfilePhotos: {
        short: 'getUserPhoto',
        arguments: 'user_id',
        options: (form, opt) => {
            if (opt.offset) form.offset = opt.offset;
            if (opt.limit) form.limit = opt.limit;
            return form;
        }
    },

    getFile(file_id) {
        return this.request(`/getFile`, {file_id}).then(file => {
            const result = file.result;
            result.fileLink = this.fileLink + result.file_path;
            return result;
        });
    },

    sendGame: {
        arguments: ['chat_id', 'game_short_name']
    },

    setGameScore: {
        arguments: ['user_id', 'score'],
        options: (form, opt) => {
            if (opt.force) form.force = opt.force;
            if (opt.chatId) form.chat_id = opt.chatId;
            if (opt.messageId) form.message_id = opt.messageId;
            if (opt.inlineMessageId) form.inline_message_id = opt.inlineMessageId;
            if (opt.disableEditMessage) form.disable_edit_message = opt.disableEditMessage;
            return form;
        }
    },

    getGameHighScores: {
        arguments: ['user_id'],
        options: (form, opt) => {
            if (opt.chatId) form.chat_id = opt.chatId;
            if (opt.messageId) form.message_id = opt.messageId;
            if (opt.inlineMessageId) form.inline_message_id = opt.inlineMessageId;
            return form;
        }
    },

    sendInvoice: {
        arguments: ['chat_id'],
        options: (form, opt) => {
            const photo = opt.photo || {};
            const need = opt.need || {};

            form.title = opt.title;
            form.description = opt.description;
            form.payload = opt.payload;
            form.provider_token = opt.providerToken;
            form.start_parameter = opt.startParameter;
            form.currency = opt.currency;
            form.prices = JSON.stringify(opt.prices);

            if (photo.url) form.photo_url = photo.url;
            if (Number.isInteger(photo.size)) form.photo_size = photo.size;
            if (Number.isInteger(photo.width)) form.photo_width = photo.width;
            if (Number.isInteger(photo.height)) form.photo_height = photo.height;

            if (need.name === true) form.need_name = need.name;
            if (need.phoneNumber === true) form.need_phone_number = need.phoneNumber;
            if (need.email === true) form.need_email = need.email;
            if (need.shippingAddress === true) form.need_shipping_address = need.shippingAddress;

            if (opt.isFlexible === true) form.is_flexible = opt.isFlexible;

            return form;
        }
    },

    getChat: {
        arguments: ['chat_id']
    },

    leaveChat: {
        arguments: ['chat_id']
    },

    getChatAdministrators: {
        short: 'getAdmins',
        arguments: ['chat_id']
    },

    getChatMember: {
        short: 'getMember',
        arguments: ['chat_id', 'user_id']
    },

    getChatMembersCount: {
        short: 'countMembers',
        arguments: ['chat_id']
    },

    kickChatMember: {
        short: 'kick',
        arguments: ['chat_id', 'user_id']
    },

    unbanChatMember: {
        short: 'unban',
        arguments: ['chat_id', 'user_id']
    },

    answerInlineQuery: {
        short: 'answerQuery',
        arguments(answers) {
            const data = {
                inline_query_id: answers.id,
                results: answers.results(),
                next_offset: answers.nextOffset,
                is_personal: answers.personal,
                cache_time: answers.cacheTime
            };

            if (answers.pmText !== undefined) data.switch_pm_text = answers.pmText;
            if (answers.pmParameter !== undefined) data.switch_pm_parameter = answers.pmParameter;

            return data;
        }
    },

    answerCallbackQuery: {
        short: 'answerCallback',
        arguments: ['callback_query_id'],
        options: (form, opt) => {
            if (opt.text) form.text = opt.text;
            if (opt.url) form.url = opt.url;
            if (opt.showAlert) form.show_alert = opt.showAlert;
            if (opt.cacheTime) form.cache_time = opt.cacheTime;
            return form;
        }
    },

    answerShippingQuery: {
        arguments: ['shipping_query_id', 'ok'],
        options: (form, opt) => {
            if (opt.shippingOptions) form.shipping_options = opt.shippingOptions;
            if (opt.errorMessage) form.error_message = opt.errorMessage;
            return form;
        }
    },

    answerPreCheckoutQuery: {
        arguments: ['pre_checkout_query_id', 'ok'],
        options: (form, opt) => {
            if (opt.errorMessage) form.error_message = opt.errorMessage;
            return form;
        }
    },

    deleteMessage: {
        arguments: ['chat_id', 'message_id']
    },

    editMessageText: {
        short: 'editText',
        arguments: (obj, text) => editObject(obj, {text})
    },

    editMessageCaption: {
        short: 'editCaption',
        arguments: (obj, caption) => editObject(obj, {caption})
    },

    editMessageReplyMarkup: {
        short: 'editMarkup',
        arguments: (obj, reply_markup) => editObject(obj, {reply_markup})
    },

    setWebhook(url, certificate, allowedUpdates, maxConnections) {
        const form = {url};

        if (Array.isArray(allowedUpdates)) {
            form.allowed_updates = allowedUpdates;
        }

        if (Number.isInteger(maxConnections)) {
            form.max_connections = maxConnections;
        }

        if (certificate) {
            form.certificate = {
                value: fs.readFileSync(certificate),
                options: {
                    filename: 'cert.pem'
                }
            };
            return this.request('/setWebhook', null, form);
        }

        return this.request('/setWebhook', form);
    },

    getWebhookInfo: {
        then: data => data.result
    },

    deleteWebhook: {
        then: data => data.result
    }

};

// Functions

function editObject(obj, form) {
    if (obj.chatId && obj.messageId) {
        form.chat_id = obj.chatId;
        form.message_id = obj.messageId;
    } else if (obj.inlineMsgId) {
        form.inline_message_id = obj.inlineMsgId;
    }
    return form;
}

function sendFile(type, chat_id, file, opt = {}, methodForm = {}) {

    methodForm.chat_id = chat_id;

    const form = this.properties(methodForm, opt);
    const defName = `file.${ DEFAULT_FILE_EXTS[type] }`;

    const url = 'send' + type.charAt(0).toUpperCase() + type.slice(1);

    // Send bot action event
    this.event(url, [].slice.call(arguments).splice(0, 1));

    // Set file caption
    if (opt.caption) form.caption = opt.caption;

    if (file instanceof stream.Stream) {
        // File stream object
        if (!opt.fileName) {
            opt.fileName = nurl.parse(path.basename(file.path)).pathname;
        }
        form[type] = {
            value: file,
            options: {filename: opt.fileName}
        };
    } else if (Buffer.isBuffer(file)) {
        // File buffer
        if (!opt.fileName) opt.fileName = defName;
        form[type] = {
            value: file,
            options: {filename: opt.fileName}
        };
    } else if (reURL.test(file)) {
        // File url
        if (!opt.fileName) {
            opt.fileName = path.basename(nurl.parse(file).pathname) || defName;
        }
        if (opt.serverDownload === true) {
            // Download by our server
            form[type] = {
                value: request.get(file),
                options: {filename: opt.fileName}
            };
        } else {
            // Download by Telegram server
            form[type] = file;
        }
    } else if (fs.existsSync(file)) {
        // File location
        if (!opt.fileName) opt.fileName = path.basename(file);
        form[type] = {
            value: fs.createReadStream(file),
            options: {filename: opt.fileName}
        };
    } else {
        // File as 'file_id'
        form[type] = file;
    }

    return this.request(`/${ url }`, null, form);

}

/* Answer List */

class AnswerList {

    constructor(id, opt = {}) {
        this.id = id;
        this.cacheTime = Number(opt.cacheTime) || 300;
        this.nextOffset = opt.nextOffset === undefined ? null : opt.nextOffset;
        this.personal = opt.personal === undefined ? false : opt.personal;
        this.pmText = opt.pmText;
        this.pmParameter = opt.pmParameter;
        this.list = [];
    }

    add(type, set = {}) {
        set.type = type;
        this.list.push(set);
        return set;
    }

    results() {
        return JSON.stringify(this.list);
    }

}

// Add answer methods
{
    for (let prop in ANSWER_METHODS) {
        AnswerList.prototype[prop] = (name => {
            return function (set) {
                return this.add(name, set);
            };
        })(ANSWER_METHODS[prop]);
    }
}

// Export methods
module.exports = methods;
