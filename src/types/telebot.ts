import {
    CallbackQuery,
    ChosenInlineResult,
    InlineQuery,
    Message,
    Poll,
    PollAnswer,
    PreCheckoutQuery,
    ShippingQuery,
    TelegramBotToken,
    UpdateTypes
} from "./telegram";
import { RequireFields } from "./utilites";
import { TeleBotDevOptions } from "../telebot/devkit";
import { TeleBotError, TelegramError } from "../errors";

export type TeleBotOptions = {
    token: TelegramBotToken;
    botAPI?: string; // TODO: remove from options
    polling?: Partial<TeleBotPolling>;
    webhook?: WebhookOptions;
    allowedUpdates?: UpdateTypes | undefined;
    debug?: boolean | TeleBotDevOptions;
    // scenarios?: {
    //     onRunningInstanceStart?: TeleBotRunningInstanceScenario;
    //     onTelegramFetchError?: TelegramFetchErrorScenario;
    // };
};

export type WebhookOptions = {
    url: string;
    host?: string;
    port?: number;
    key?: string;
    cert?: string;
};

export type TeleBotFlags = {
    isRunning: boolean;
    canFetch: boolean;
    waitEvents: boolean;
};

export type TeleBotPolling = {
    offset: number;
    interval: number | false;
    timeout: number;
    limit: number;
    retryTimes: number;
    retryTimeout: number;
};

export enum TeleBotScenario {
    Reconnect = "reconnect",
    Restart = "restart",
    Terminate = "terminate",
    Pass = "pass"
}

export type TeleBotRunningInstanceScenario =
    TeleBotScenario.Restart |
    TeleBotScenario.Terminate |
    TeleBotScenario.Pass;

export type TelegramFetchErrorScenario = TeleBotScenario.Reconnect | TeleBotScenario.Terminate;

export type TeleBotEventNames = {
    text: RequireFields<Message, "text">;
    audio: RequireFields<Message, "audio">;
    video: RequireFields<Message, "video">;
    video_note: RequireFields<Message, "video_note">;
    game: RequireFields<Message, "game">;
    photo: RequireFields<Message, "photo">;
    sticker: RequireFields<Message, "sticker">;
    voice: RequireFields<Message, "voice">;
    location: RequireFields<Message, "location">;
    poll: RequireFields<Message, "poll">;
    venue: RequireFields<Message, "venue">;
    contact: RequireFields<Message, "contact">;
    animation: RequireFields<Message, "animation">;
    dice: RequireFields<Message, "dice">;
    invoice: RequireFields<Message, "invoice">;

    // new_chat_members: RequireFields<Message, "new_chat_members">;
    // left_chat_member: RequireFields<Message, "left_chat_member">;
    // new_chat_title: RequireFields<Message, "new_chat_title">;
    // new_chat_photo: RequireFields<Message, "new_chat_photo">;
    // delete_chat_photo: RequireFields<Message, "delete_chat_photo">;
    // group_chat_created: RequireFields<Message, "group_chat_created">;
    // supergroup_chat_created: RequireFields<Message, "supergroup_chat_created">;
    // channel_chat_created: RequireFields<Message, "channel_chat_created">;
    // migrate_to_chat_id: RequireFields<Message, "migrate_to_chat_id">;
    // migrate_from_chat_id: RequireFields<Message, "migrate_from_chat_id">;
    // passport_data: RequireFields<Message, "passport_data">;
    // successful_payment: RequireFields<Message, "successful_payment">;
    // pinned_message: RequireFields<Message, "pinned_message">;

    message: Message;
    edited_message: Message;
    channel_post: Message;
    edited_channel_post: Message;
    inline_query: InlineQuery;
    chosen_inline_result: ChosenInlineResult;
    callback_query: CallbackQuery;
    shipping_query: ShippingQuery;
    pre_checkout_query: PreCheckoutQuery;
    poll_update: Poll;
    poll_answer: PollAnswer;

    error: TeleBotError | TelegramError | Error;
};

export type TeleBotEventProcessorContext = {
    unsubscribe: any;
};

export type ContextPayload = Record<string, any>;

export type TeleBotEventProcessor<T extends keyof TeleBotEventNames> = (data: TeleBotEventNames[T], context: TeleBotEventProcessorContext) => any;

export type TeleBotEvent = {
    processors: Set<TeleBotEventProcessor<any>>;
};

export type EventType = string;
export type EventTypes = EventType | EventType[];
export type ComplexEventType = EventType;
export type ComplexEvents = ComplexEventType | ComplexEventType[];

