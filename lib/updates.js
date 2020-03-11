// Command regexp
const REGEXP_COMMAND = /^\/([0-9а-я\w\d_-]+)/;

// Message types
const MESSAGE_TYPES = [
    'new_chat_members', 'left_chat_member', 'new_chat_title',
    'new_chat_photo', 'delete_chat_photo', 'group_chat_created',
    'supergroup_chat_created', 'channel_chat_created', 'migrate_to_chat_id',
    'migrate_from_chat_id', 'pinned_message', 'edit_date', 'forward_date',
    'text', 'audio', 'voice', 'document', 'photo', 'sticker', 'video', 'video_note', 'animation',
    'contact', 'location', 'venue', 'game', 'invoice', 'successful_payment', 'passport_data', 'reply_markup'
];

const SHORTCUTS = {
    edit_date: 'edit',
    video_note: 'videoNote',
    forward_date: 'forward',
    new_chat_members: 'newChatMembers',
    left_chat_member: 'leftChatMember',
    new_chat_title: 'newChatTitle',
    new_chat_photo: 'newChatPhoto',
    delete_chat_photo: 'deleteChatPhoto',
    pinned_message: 'pinnedMessage',
    group_chat_created: 'groupChatCreated',
    channel_chat_created: 'channelChatCreated',
    supergroup_chat_created: 'supergroupChatCreated',
    migrate_to_chat_id: 'migrateToChat',
    migrate_from_chat_id: 'migrateFromChat',
    successful_payment: 'successfulPayment',
    passport_data: 'passportData',
};

// Update type functions
const updateFunctions = {

    // Message
    message(update, props) {

        // Any event status: ['*', '/*']
        let anyEventFlags = [false, false];

        let promise = Promise.resolve();
        let mod = this.modRun('message', {message: update, props});

        update = mod.message;
        props = mod.props;
        promise = promise.then(() => mod.promise);

        for (let type of MESSAGE_TYPES) {

            // Check for Telegram API documented types
            if (!(type in update)) continue;

            // Shortcut
            if (SHORTCUTS[type]) type = SHORTCUTS[type];

            // Set message type
            props.type = type;

            // Run message type mod
            mod = this.modRun(type, {message: update, props});

            update = mod.message;
            props = mod.props;
            promise = promise.then(() => mod.promise);

            const eventList = [type];
            if (!anyEventFlags[0]) {
                eventList.push('*');
                anyEventFlags[0] = true;
            }

            promise = promise.then(() => {
                return this.event(eventList, update, props);
            });

            // Check for command
            if (type === 'text') {

                const match = REGEXP_COMMAND.exec(update.text);
                if (!match) continue;

                // Command found
                props.type = 'command';

                const eventList = ['/' + match[1]];
                if (!anyEventFlags[1]) {
                    eventList.push(['/*']);
                    anyEventFlags[1] = true;
                }

                promise = promise.then(() => {
                    return this.event(eventList, update, props);
                });

            }

            break;

        }

        return promise;
    },

    // Channel post
    channel_post(update, props) {
        return updateFunctions.message.call(this, update, props);
    },

    // Edited hannel post
    edited_channel_post(update, props) {
        return updateFunctions.message.call(this, update, props);
    },

    // Edited message
    edited_message(update, props) {
        return updateFunctions.message.call(this, update, props);
    },

    // Inline query
    inline_query(update, props) {
        props.type = 'inlineQuery';
        return this.event('inlineQuery', update, props);
    },

    // Inline choice
    chosen_inline_result(update, props) {
        props.type = 'chosenInlineResult';
        return this.event([props.type, 'inlineChoice'], update, props);
    },

    // Callback query
    callback_query(update, props) {
        props.type = 'callbackQuery';
        return this.event('callbackQuery', update, props);
    },

    shipping_query(update, props) {
        props.type = 'shippingQuery';
        return this.event('shippingQuery', update, props);
    },

    pre_checkout_query(update, props) {
        props.type = 'preShippingQuery';
        return this.event('preShippingQuery', update, props);
    }

};

module.exports = updateFunctions;
