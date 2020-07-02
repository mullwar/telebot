import { TeleBot } from "../telebot";
import {
    CallbackQuery,
    ChosenInlineResult,
    InlineQuery,
    Message,
    Poll,
    PollAnswer,
    PreCheckoutQuery,
    ShippingQuery
} from "../types/telegram";

const messageTypes = [
    "text",
    "animation",
    "audio",
    "sticker",
    "video",
    "video_note",
    "voice",
    "dice",
    "game",
    "venue",
    "photo",
    "document",
    "location",
    "contact",
    "poll"
    // "new_chat_members",
    // "left_chat_member",
    // "new_chat_title",
    // "new_chat_title",
    // "new_chat_photo",
    // "delete_chat_photo",
    // "group_chat_created",
    // "supergroup_chat_created",
    // "channel_chat_created",
    // "migrate_to_chat_id",
    // "migrate_from_chat_id",
    // "passport_data",
    // "successful_payment",
    // "pinned_message"
];

export const updateProcessors = {
    edited_message(this: TeleBot, messageUpdate: Message): Promise<any> {
        return this.dispatch("edited_message", messageUpdate);
    },
    channel_post(this: TeleBot, messageUpdate: Message): Promise<any> {
        return this.dispatch("channel_post", messageUpdate);
    },
    edited_channel_post(this: TeleBot, messageUpdate: Message): Promise<any> {
        return this.dispatch("edited_channel_post", messageUpdate);
    },
    inline_query(this: TeleBot, inlineQueryUpdate: InlineQuery): Promise<any> {
        return this.dispatch("inline_query", inlineQueryUpdate);
    },
    chosen_inline_result(this: TeleBot, chosenInlineUpdate: ChosenInlineResult): Promise<any> {
        return this.dispatch("chosen_inline_result", chosenInlineUpdate);
    },
    callback_query(this: TeleBot, callbackQueryUpdate: CallbackQuery): Promise<any> {
        return this.dispatch("callback_query", callbackQueryUpdate);
    },
    shipping_query(this: TeleBot, shippingQueryUpdate: ShippingQuery): Promise<any> {
        return this.dispatch("shipping_query", shippingQueryUpdate);
    },
    pre_checkout_query(this: TeleBot, preCheckoutQueryUpdate: PreCheckoutQuery): Promise<any> {
        return this.dispatch("pre_checkout_query", preCheckoutQueryUpdate);
    },
    poll(this: TeleBot, pollUpdate: Poll): Promise<any> {
        return this.dispatch("poll_update", pollUpdate);
    },
    poll_answer(this: TeleBot, pollAnswerUpdate: PollAnswer): Promise<any> {
        return this.dispatch("poll_answer", pollAnswerUpdate);
    },
    message(this: TeleBot, messageUpdate: Message): Promise<any> {
        const processorPromises: Promise<any>[] = [];
        processorPromises.push(this.dispatch("message", messageUpdate));
        for (const messageType of messageTypes) {
            if (messageType in messageUpdate) {
                processorPromises.push(this.dispatch(messageType, messageUpdate));
                break;
            }
        }
        return Promise.resolve(Promise.all(processorPromises));
    }
};
