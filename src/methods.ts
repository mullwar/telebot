import { TeleBot } from "./telebot";
import { BotInputFile, ChatId, Message, TelegramMessageOptional, User } from "./types/telegram";

type MethodResponse<T = Message> = Promise<T>;

declare module "./telebot" {
    interface TeleBot {
        getMe(): MethodResponse<User>;

        sendMessage(
            chat_id: ChatId,
            text: string,
            optional?: TelegramMessageOptional
        ): MethodResponse;

        forwardMessage(
            chat_id: ChatId,
            from_chat_id: ChatId,
            message_id: number,
            optional?: {
                disable_web_page_preview?: boolean;
            } & Pick<TelegramMessageOptional, "disable_notification">
        ): MethodResponse;

        sendPhoto(
            chat_id: ChatId,
            photo: BotInputFile,
            optional?: {
                caption?: string;
            } & TelegramMessageOptional
        ): MethodResponse;

        sendAudio(
            chat_id: ChatId,
            audio: BotInputFile,
            optional?: {
                duration?: number;
                performer?: string;
                title?: string;
                caption?: string;
                thumb?: BotInputFile;
            } & TelegramMessageOptional
        ): MethodResponse;

        sendDocument(
            chat_id: ChatId,
            document: BotInputFile,
            optional?: {
                caption?: string;
                thumb?: BotInputFile;
            } & TelegramMessageOptional
        ): MethodResponse;
    }
}

TeleBot.prototype.getMe = function () {
    return this.telegramMethod<User>({
        method: "getME"
    });
};

TeleBot.prototype.sendMessage = function (chat_id, text, optional) {
    return this.telegramMethod<Message>({
        method: "sendMessage",
        required: { chat_id, text },
        optional
    });
};

TeleBot.prototype.forwardMessage = function (chat_id, from_chat_id, message_id, ...optional) {
    return this.telegramMethod<Message>({
        method: "forwardMessage",
        required: { chat_id, from_chat_id, message_id },
        optional
    });
};

