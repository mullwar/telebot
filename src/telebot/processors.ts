import { TeleBot } from "../telebot";
import {
    CallbackQuery,
    ChatMemberUpdated,
    ChosenInlineResult,
    InlineQuery,
    Message,
    Poll,
    PollAnswer,
    PreCheckoutQuery,
    ShippingQuery,
    TelegramMessageNames,
    Update
} from "../types/telegram";
import { TypeValues } from "../types/utilites";
import { TeleBotEventContext, TeleBotEventNames } from "../types/telebot";

const MESSAGE_TYPES: Array<TelegramMessageNames> = [
    "text",
    "audio",
    "document",
    "animation",
    "game",
    "photo",
    "sticker",
    "video",
    "video_note",
    "voice",
    "caption",
    "contact",
    "location",
    "venue",
    "poll",
    "dice",
    "new_chat_members",
    "left_chat_member",
    "new_chat_title",
    "new_chat_photo",
    "delete_chat_photo",
    "group_chat_created",
    "supergroup_chat_created",
    "channel_chat_created",
    "message_auto_delete_timer_changed",
    "migrate_to_chat_id",
    "migrate_from_chat_id",
    "pinned_message",
    "invoice",
    "successful_payment",
    "connected_website",
    "passport_data",
    "proximity_alert_triggered",
    "voice_chat_started",
    "voice_chat_ended",
    "voice_chat_participants_invited"
];

export type TelegramUpdateKeys = Omit<Update, "update_id"> & { update: Update };

type TelegramUpdateType = Exclude<TypeValues<TelegramUpdateKeys>, undefined> & any; // TODO: fix union problem:
type TelegramUpdateFunction = (this: TeleBot, update: TelegramUpdateType, context: TeleBotEventContext) => Promise<unknown>;

export type TelegramUpdateProcessors = keyof Required<TelegramUpdateKeys>;

export const TELEGRAM_UPDATE_PROCESSORS: Record<TelegramUpdateProcessors, TelegramUpdateFunction> = {
    update(this: TeleBot, update: Update, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("update", update, context);
    },
    edited_message(this: TeleBot, messageUpdate: Message, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("edited_message", messageUpdate, context);
    },
    channel_post(this: TeleBot, messageUpdate: Message, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("channel_post", messageUpdate, context);
    },
    edited_channel_post(this: TeleBot, messageUpdate: Message, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("edited_channel_post", messageUpdate, context);
    },
    inline_query(this: TeleBot, inlineQueryUpdate: InlineQuery, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("inline_query", inlineQueryUpdate, context);
    },
    chosen_inline_result(this: TeleBot, chosenInlineUpdate: ChosenInlineResult, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("chosen_inline_result", chosenInlineUpdate, context);
    },
    callback_query(this: TeleBot, callbackQueryUpdate: CallbackQuery, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("callback_query", callbackQueryUpdate, context);
    },
    shipping_query(this: TeleBot, shippingQueryUpdate: ShippingQuery, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("shipping_query", shippingQueryUpdate, context);
    },
    pre_checkout_query(this: TeleBot, preCheckoutQueryUpdate: PreCheckoutQuery, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("pre_checkout_query", preCheckoutQueryUpdate, context);
    },
    poll(this: TeleBot, pollUpdate: Poll, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch<"poll", Poll>("poll", pollUpdate, context);
    },
    poll_answer(this: TeleBot, pollAnswerUpdate: PollAnswer, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("poll_answer", pollAnswerUpdate, context);
    },
    my_chat_member(this: TeleBot, myChatMember: ChatMemberUpdated, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("my_chat_member", myChatMember, context);
    },
    chat_member(this: TeleBot, chatMember: ChatMemberUpdated, context: TeleBotEventContext): Promise<unknown> {
        return this.dispatch("chat_member", chatMember, context);
    },
    async message(this: TeleBot, messageUpdate: Message, context: TeleBotEventContext): Promise<unknown> {
        const processorPromises: Promise<unknown>[] = [];
        processorPromises.push(this.dispatch("message", messageUpdate, context));
        for (const messageType of MESSAGE_TYPES) {
            if (messageType in messageUpdate) {
                const modifiedMessageUpdate = await this.run(messageType, { ...messageUpdate });
                processorPromises.push(this.dispatch(messageType, modifiedMessageUpdate, context));
                if (messageType === "text") {
                    processorPromises.push(
                        this.dispatchHears(messageUpdate.text!, modifiedMessageUpdate as TeleBotEventNames["text"])
                    );
                }
                break;
            }
        }
        return Promise.resolve(Promise.all(processorPromises));
    }
};
