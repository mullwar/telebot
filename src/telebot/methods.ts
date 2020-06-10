import { TeleBot } from "../telebot";
import {
    BotCommand,
    Chat,
    ChatMember,
    GameHighScore,
    Message,
    Poll,
    StickerSet,
    User,
    UserProfilePhotos,
    WebhookInfo,
    WebhookResponse
} from "../types/telegram";

TeleBot.prototype.getMe = function () {
    return this.telegramMethod<User>({
        method: "getMe"
    });
};

TeleBot.prototype.sendMessage = function (chat_id, text, optional) {
    return this.telegramMethod<Message>({
        method: "sendMessage",
        required: { chat_id, text },
        optional
    });
};

TeleBot.prototype.forwardMessage = function (chat_id, from_chat_id, message_id, optional) {
    return this.telegramMethod<Message>({
        method: "forwardMessage",
        required: { chat_id, from_chat_id, message_id },
        optional
    });
};

TeleBot.prototype.sendPhoto = function (chat_id, photo, optional) {
    return this.telegramMethod<Message>({
        method: "sendPhoto",
        required: { chat_id, photo },
        optional
    });
};

TeleBot.prototype.sendAudio = function (chat_id, audio, optional) {
    return this.telegramMethod<Message>({
        method: "sendAudio",
        required: { chat_id, audio },
        optional
    });
};

TeleBot.prototype.sendDocument = function (chat_id, document, optional) {
    return this.telegramMethod<Message>({
        method: "sendDocument",
        required: { chat_id, document },
        optional
    });
};

TeleBot.prototype.sendVideo = function (chat_id, video, optional) {
    return this.telegramMethod<Message>({
        method: "sendVideo",
        required: { chat_id, video },
        optional
    });
};

TeleBot.prototype.sendAnimation = function (chat_id, animation, optional) {
    return this.telegramMethod<Message>({
        method: "sendAnimation",
        required: { chat_id, animation },
        optional
    });
};


TeleBot.prototype.sendVoice = function (chat_id, voice, optional) {
    return this.telegramMethod<Message>({
        method: "sendVoice",
        required: { chat_id, voice },
        optional
    });
};

TeleBot.prototype.sendVideoNote = function (chat_id, video_note, optional) {
    return this.telegramMethod<Message>({
        method: "sendVideoNote",
        required: { chat_id, video_note },
        optional
    });
};

TeleBot.prototype.sendMediaGroup = function (chat_id, media, optional) {
    return this.telegramMethod<Message>({
        method: "sendMediaGroup",
        required: { chat_id, media },
        optional
    });
};

TeleBot.prototype.sendLocation = function (chat_id, latitude, longitude, optional) {
    return this.telegramMethod<Message>({
        method: "sendLocation",
        required: { chat_id, latitude, longitude },
        optional
    });
};

TeleBot.prototype.editMessageLiveLocation = function ({ latitude, longitude, ...optional }) {
    return this.telegramMethod<Message | true>({
        method: "editMessageLiveLocation",
        required: { latitude, longitude },
        optional
    });
};

TeleBot.prototype.stopMessageLiveLocation = function ({ ...optional }) {
    return this.telegramMethod<Message | true>({
        method: "stopMessageLiveLocation",
        required: {},
        optional
    });
};

TeleBot.prototype.sendVenue = function ({
    chat_id,
    latitude,
    longitude,
    title,
    address,
    ...optional
}) {
    return this.telegramMethod<Message>({
        method: "sendVenue",
        required: { chat_id, latitude, longitude, title, address },
        optional
    });
};

TeleBot.prototype.sendContact = function (chat_id, phone_number, first_name, optional) {
    return this.telegramMethod<Message>({
        method: "sendContact",
        required: { chat_id, phone_number, first_name },
        optional
    });
};

TeleBot.prototype.sendPoll = function (chat_id, question, options, optional) {
    return this.telegramMethod<Message>({
        method: "sendPoll",
        required: { chat_id, question, options },
        optional
    });
};

TeleBot.prototype.sendDice = function (chat_id, emoji, optional) {
    return this.telegramMethod<Message>({
        method: "sendDice",
        required: { chat_id, emoji },
        optional
    });
};

TeleBot.prototype.sendChatAction = function (chat_id, action) {
    return this.telegramMethod<true>({
        method: "sendChatAction",
        required: { chat_id, action },
        optional: {}
    });
};

TeleBot.prototype.getUserProfilePhotos = function (chat_id, optional) {
    return this.telegramMethod<UserProfilePhotos>({
        method: "getUserProfilePhotos",
        required: { chat_id },
        optional: optional
    });
};

TeleBot.prototype.getFile = function (chat_id) {
    return this.telegramMethod<File>({
        method: "getFile",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.kickChatMember = function (chat_id, user_id, optional) {
    return this.telegramMethod<true>({
        method: "kickChatMember",
        required: { chat_id, user_id },
        optional
    });
};

TeleBot.prototype.unbanChatMember = function (chat_id, user_id) {
    return this.telegramMethod<true>({
        method: "unbanChatMember",
        required: { chat_id, user_id },
        optional: {}
    });
};

TeleBot.prototype.restrictChatMember = function (
    chat_id,
    user_id,
    permissions,
    optional
) {
    return this.telegramMethod<true>({
        method: "restrictChatMember",
        required: { chat_id, user_id, permissions },
        optional
    });
};

TeleBot.prototype.promoteChatMember = function (chat_id, user_id, optional) {
    return this.telegramMethod<true>({
        method: "promoteChatMember",
        required: { chat_id, user_id },
        optional
    });
};

TeleBot.prototype.setChatAdministratorCustomTitle = function (chat_id, user_id, custom_title) {
    return this.telegramMethod<true>({
        method: "setChatAdministratorCustomTitle",
        required: { chat_id, user_id, custom_title },
        optional: {}
    });
};

TeleBot.prototype.exportChatInviteLink = function (chat_id) {
    return this.telegramMethod<string>({
        method: "exportChatInviteLink",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.setChatPhoto = function (chat_id, photo) {
    return this.telegramMethod<true>({
        method: "setChatPhoto",
        required: { chat_id, photo },
        optional: {}
    });
};

TeleBot.prototype.deleteChatPhoto = function (chat_id) {
    return this.telegramMethod<true>({
        method: "deleteChatPhoto",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.setChatTitle = function (chat_id, title) {
    return this.telegramMethod<true>({
        method: "setChatTitle",
        required: { chat_id, title },
        optional: {}
    });
};

TeleBot.prototype.setChatDescription = function (chat_id, optional) {
    return this.telegramMethod<true>({
        method: "setChatDescription",
        required: { chat_id },
        optional
    });
};

TeleBot.prototype.pinChatMessage = function (chat_id, message_id, optional) {
    return this.telegramMethod<true>({
        method: "pinChatMessage",
        required: { chat_id, message_id },
        optional
    });
};

TeleBot.prototype.unpinChatMessage = function (chat_id) {
    return this.telegramMethod<true>({
        method: "unpinChatMessage",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.leaveChat = function (chat_id) {
    return this.telegramMethod<true>({
        method: "leaveChat",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.getChat = function (chat_id) {
    return this.telegramMethod<Chat>({
        method: "getChat",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.getChatAdministrators = function (chat_id) {
    return this.telegramMethod<ChatMember[]>({
        method: "getChat",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.getChatMembersCount = function (chat_id) {
    return this.telegramMethod<number>({
        method: "getChatMembersCount",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.getChatMember = function (chat_id, user_id) {
    return this.telegramMethod<ChatMember>({
        method: "getChatMember",
        required: { chat_id, user_id },
        optional: {}
    });
};

TeleBot.prototype.setChatStickerSet = function (chat_id, sticker_set_name) {
    return this.telegramMethod<true>({
        method: "setChatStickerSet",
        required: { chat_id, sticker_set_name },
        optional: {}
    });
};

TeleBot.prototype.deleteChatStickerSet = function (chat_id) {
    return this.telegramMethod<true>({
        method: "deleteChatStickerSet",
        required: { chat_id },
        optional: {}
    });
};

TeleBot.prototype.answerCallbackQuery = function (callback_query_id, optional) {
    return this.telegramMethod<true>({
        method: "answerCallbackQuery",
        required: { callback_query_id },
        optional
    });
};

TeleBot.prototype.setMyCommands = function (commands) {
    return this.telegramMethod<true>({
        method: "setMyCommands",
        required: { commands },
        optional: {}
    });
};

TeleBot.prototype.getMyCommands = function () {
    return this.telegramMethod<BotCommand[]>({
        method: "getMyCommands",
        required: {},
        optional: {}
    });
};

TeleBot.prototype.editMessageText = function ({ text, ...optional }) {
    return this.telegramMethod<Message | true>({
        method: "editMessageText",
        required: { text },
        optional
    });
};

TeleBot.prototype.editMessageCaption = function (props) {
    return this.telegramMethod<Message | true>({
        method: "editMessageCaption",
        required: {},
        optional: props
    });
};

TeleBot.prototype.editMessageMedia = function ({ media, ...optional }) {
    return this.telegramMethod<Message | true>({
        method: "editMessageCaption",
        required: { media },
        optional
    });
};

TeleBot.prototype.editMessageReplyMarkup = function (props) {
    return this.telegramMethod<Message | true>({
        method: "editMessageReplyMarkup",
        required: {},
        optional: props
    });
};

TeleBot.prototype.stopPoll = function (chat_id, message_id, optional) {
    return this.telegramMethod<Poll>({
        method: "stopPoll",
        required: { chat_id, message_id },
        optional
    });
};

TeleBot.prototype.deleteMessage = function (chat_id, message_id) {
    return this.telegramMethod<true>({
        method: "deleteMessage",
        required: { chat_id, message_id },
        optional: {}
    });
};

TeleBot.prototype.sendSticker = function (chat_id, sticker, optional) {
    return this.telegramMethod<Message>({
        method: "sendSticker",
        required: { chat_id, sticker },
        optional
    });
};

TeleBot.prototype.getStickerSet = function (name) {
    return this.telegramMethod<StickerSet>({
        method: "getStickerSet",
        required: { name },
        optional: {}
    });
};

TeleBot.prototype.uploadStickerFile = function (user_id, png_sticker) {
    return this.telegramMethod<File>({
        method: "uploadStickerFile",
        required: { user_id, png_sticker },
        optional: {}
    });
};

TeleBot.prototype.createNewStickerSet = function ({ user_id, name, title, emojis, ...optional }) {
    return this.telegramMethod<true>({
        method: "createNewStickerSet",
        required: { user_id, name, title, emojis },
        optional
    });
};

TeleBot.prototype.addStickerToSet = function (user_id, name, optional) {
    return this.telegramMethod<true>({
        method: "addStickerToSet",
        required: { user_id, name },
        optional
    });
};

TeleBot.prototype.setStickerPositionInSet = function (sticker, position) {
    return this.telegramMethod<true>({
        method: "setStickerPositionInSet",
        required: { sticker, position },
        optional: {}
    });
};

TeleBot.prototype.setStickerSetThumb = function (name, user_id, optional) {
    return this.telegramMethod<true>({
        method: "setStickerSetThumb",
        required: { name, user_id },
        optional
    });
};

TeleBot.prototype.answerInlineQuery = function (inline_query_id, results, optional) {
    return this.telegramMethod<true>({
        method: "answerInlineQuery",
        required: { inline_query_id, results },
        optional
    });
};

TeleBot.prototype.sendInvoice = function ({
    chat_id,
    title,
    description,
    payload,
    provider_token,
    start_parameter,
    currency,
    ...optional
}) {
    return this.telegramMethod<Message>({
        method: "answerInlineQuery",
        required: {
            chat_id,
            title,
            description,
            payload,
            provider_token,
            start_parameter,
            currency
        },
        optional
    });
};

TeleBot.prototype.answerShippingQuery = function (shipping_query_id, ok, optional) {
    return this.telegramMethod<true>({
        method: "answerShippingQuery",
        required: { shipping_query_id, ok },
        optional
    });
};

TeleBot.prototype.answerPreCheckoutQuery = function (pre_checkout_query_id, ok, optional) {
    return this.telegramMethod<true>({
        method: "answerPreCheckoutQuery",
        required: { pre_checkout_query_id, ok },
        optional
    });
};

TeleBot.prototype.setPassportDataErrors = function (user_id, errors) {
    return this.telegramMethod<true>({
        method: "setPassportDataErrors",
        required: { user_id, errors },
        optional: {}
    });
};

TeleBot.prototype.sendGame = function (chat_id, game_short_name, optional) {
    return this.telegramMethod<Message>({
        method: "sendGame",
        required: { chat_id, game_short_name },
        optional
    });
};

TeleBot.prototype.setGameScore = function (chat_id, score, optional) {
    return this.telegramMethod<Message>({
        method: "setGameScore",
        required: { chat_id, score },
        optional
    });
};

TeleBot.prototype.getGameHighScores = function (user_id, optional) {
    return this.telegramMethod<GameHighScore[]>({
        method: "getGameHighScores",
        required: { user_id },
        optional
    });
};

TeleBot.prototype.setWebhook = function (url, optional) {
    return this.telegramMethod<WebhookResponse>({
        method: "setWebhook",
        required: { url },
        optional
    });
};

TeleBot.prototype.deleteWebhook = function () {
    return this.telegramMethod<WebhookResponse>({
        method: "deleteWebhook"
    });
};

TeleBot.prototype.getWebhookInfo = function () {
    return this.telegramMethod<WebhookInfo>({
        method: "getWebhookInfo"
    });
};

