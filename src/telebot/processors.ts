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
import { ContextPayload } from "../types/telebot";

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
    edited_message(this: TeleBot, messageUpdate: Message, context: ContextPayload): Promise<any> {
        return this.dispatch("edited_message", messageUpdate, context);
    },
    channel_post(this: TeleBot, messageUpdate: Message, context: ContextPayload): Promise<any> {
        return this.dispatch("channel_post", messageUpdate, context);
    },
    edited_channel_post(this: TeleBot, messageUpdate: Message, context: ContextPayload): Promise<any> {
        return this.dispatch("edited_channel_post", messageUpdate, context);
    },
    inline_query(this: TeleBot, inlineQueryUpdate: InlineQuery, context: ContextPayload): Promise<any> {
        return this.dispatch("inline_query", inlineQueryUpdate, context);
    },
    chosen_inline_result(this: TeleBot, chosenInlineUpdate: ChosenInlineResult, context: ContextPayload): Promise<any> {
        return this.dispatch("chosen_inline_result", chosenInlineUpdate, context);
    },
    callback_query(this: TeleBot, callbackQueryUpdate: CallbackQuery, context: ContextPayload): Promise<any> {
        return this.dispatch("callback_query", callbackQueryUpdate, context);
    },
    shipping_query(this: TeleBot, shippingQueryUpdate: ShippingQuery, context: ContextPayload): Promise<any> {
        return this.dispatch("shipping_query", shippingQueryUpdate, context);
    },
    pre_checkout_query(this: TeleBot, preCheckoutQueryUpdate: PreCheckoutQuery, context: ContextPayload): Promise<any> {
        return this.dispatch("pre_checkout_query", preCheckoutQueryUpdate, context);
    },
    poll(this: TeleBot, pollUpdate: Poll, context: ContextPayload): Promise<any> {
        return this.dispatch("poll_update", pollUpdate, context);
    },
    poll_answer(this: TeleBot, pollAnswerUpdate: PollAnswer, context: ContextPayload): Promise<any> {
        return this.dispatch("poll_answer", pollAnswerUpdate, context);
    },
    message(this: TeleBot, messageUpdate: Message, context: ContextPayload): Promise<any> {
        const processorPromises: Promise<any>[] = [];
        processorPromises.push(this.dispatch("message", messageUpdate, context));
        for (const messageType of messageTypes) {
            if (messageType in messageUpdate) {
                processorPromises.push(this.dispatch(messageType, messageUpdate, context));
                break;
            }
        }
        return Promise.resolve(Promise.all(processorPromises));
    }
};
