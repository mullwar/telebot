import {
    CallbackQuery,
    ChatMemberUpdated,
    ChosenInlineResult,
    InlineQuery,
    Message,
    PollAnswer,
    PreCheckoutQuery,
    ShippingQuery,
    TelegramBotToken,
    TelegramUpdateNames
} from "./telegram";
import { RequireFields } from "./utilites";
import { TeleBotDevOptions } from "../telebot/devkit";
import { TeleBotError, TelegramError } from "../errors";

export type TeleBotOptions = {
    token: TelegramBotToken;
    botAPI?: string; // TODO: remove from options
    polling?: Partial<TeleBotPolling>;
    webhook?: WebhookOptions;
    allowedUpdates?: TelegramUpdateNames | never[] | undefined;
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
    // TelegramMessageNames
    text: RequireFields<Message, "text">;
    audio: RequireFields<Message, "audio">;
    document: RequireFields<Message, "document">;
    animation: RequireFields<Message, "animation">;
    game: RequireFields<Message, "game">;
    photo: RequireFields<Message, "photo">;
    sticker: RequireFields<Message, "sticker">;
    video: RequireFields<Message, "video">;
    video_note: RequireFields<Message, "video_note">;
    voice: RequireFields<Message, "voice">;
    caption: RequireFields<Message, "caption">;
    contact: RequireFields<Message, "contact">;
    location: RequireFields<Message, "location">;
    venue: RequireFields<Message, "venue">;
    poll: RequireFields<Message, "poll">;
    dice: RequireFields<Message, "dice">;
    new_chat_members: RequireFields<Message, "new_chat_members">;
    left_chat_member: RequireFields<Message, "left_chat_member">;
    new_chat_title: RequireFields<Message, "new_chat_title">;
    new_chat_photo: RequireFields<Message, "new_chat_photo">;
    delete_chat_photo: RequireFields<Message, "delete_chat_photo">;
    group_chat_created: RequireFields<Message, "group_chat_created">;
    supergroup_chat_created: RequireFields<Message, "supergroup_chat_created">;
    channel_chat_created: RequireFields<Message, "channel_chat_created">;
    message_auto_delete_timer_changed: RequireFields<Message, "message_auto_delete_timer_changed">;
    migrate_to_chat_id: RequireFields<Message, "migrate_to_chat_id">;
    migrate_from_chat_id: RequireFields<Message, "migrate_from_chat_id">;
    pinned_message: RequireFields<Message, "pinned_message">;
    invoice: RequireFields<Message, "invoice">;
    successful_payment: RequireFields<Message, "successful_payment">;
    connected_website: RequireFields<Message, "connected_website">;
    passport_data: RequireFields<Message, "passport_data">;
    proximity_alert_triggered: RequireFields<Message, "proximity_alert_triggered">;
    voice_chat_started: RequireFields<Message, "voice_chat_started">;
    voice_chat_ended: RequireFields<Message, "voice_chat_ended">;
    voice_chat_participants_invited: RequireFields<Message, "voice_chat_participants_invited">;
    // TelegramUpdateNames
    message: Message;
    edited_message: Message;
    channel_post: Message;
    edited_channel_post: Message;
    inline_query: InlineQuery;
    chosen_inline_result: ChosenInlineResult;
    callback_query: CallbackQuery;
    shipping_query: ShippingQuery;
    pre_checkout_query: PreCheckoutQuery;
    // poll: Poll;
    poll_answer: PollAnswer;
    my_chat_member: ChatMemberUpdated;
    chat_member: ChatMemberUpdated;
    // Internal
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

export type EventType = keyof TeleBotEventNames;
export type EventTypes = EventType | EventType[];
export type ComplexEventType = EventType;
export type ComplexEvents = ComplexEventType | ComplexEventType[];

