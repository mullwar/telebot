import {
    CallbackQuery,
    ChatJoinRequest,
    ChatMemberUpdated,
    ChosenInlineResult,
    InlineQuery,
    Message,
    MethodInputFile,
    Poll,
    PollAnswer,
    PreCheckoutQuery,
    ShippingQuery,
    TelegramBotToken,
    TelegramMessageNames,
    TelegramUpdateNames,
    Update
} from "./telegram";
import { TeleBotLogOptions } from "../telebot/logger";
import { SomeKindOfError } from "../errors";
import { TelegramUpdateKeys } from "../telebot/processors";
import { AxiosProxyConfig } from "axios";
import { TeleBot } from "../telebot";

export type TeleBotOptions = {
    token: TelegramBotToken;
    botAPI?: (botToken: string) => string;
    polling?: Partial<TeleBotPolling>;
    webhook?: WebhookOptions;
    allowedUpdates?: TelegramUpdateNames[];
    proxy?: AxiosProxyConfig;
    log?: boolean | TeleBotLogOptions;
};

export type WebhookServer = {
    serverHost?: string;
    serverPort?: number;
    serverKey?: string;
    serverCert?: string;
};

export type WebhookOptions = string | {
    url: string;
    certificate?: MethodInputFile;
    ip_address?: string,
    max_connections?: number,
    allowed_updates?: TelegramUpdateNames[],
    drop_pending_updates?: boolean
} & WebhookServer;

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

type TeleBotEventMessageUpdate<T extends TelegramMessageNames> =
    Omit<Message, TelegramMessageNames>
    & Required<Pick<Message, T>>;

export type TeleBotEventNames = {
    // TelegramMessageNames
    text: TeleBotEventMessageUpdate<"text">;
    audio: TeleBotEventMessageUpdate<"audio">;
    document: TeleBotEventMessageUpdate<"document">;
    animation: TeleBotEventMessageUpdate<"animation">;
    game: TeleBotEventMessageUpdate<"game">;
    photo: TeleBotEventMessageUpdate<"photo">;
    sticker: TeleBotEventMessageUpdate<"sticker">;
    video: TeleBotEventMessageUpdate<"video">;
    video_note: TeleBotEventMessageUpdate<"video_note">;
    voice: TeleBotEventMessageUpdate<"voice">;
    caption: TeleBotEventMessageUpdate<"caption">;
    contact: TeleBotEventMessageUpdate<"contact">;
    location: TeleBotEventMessageUpdate<"location">;
    venue: TeleBotEventMessageUpdate<"venue">;
    poll: TeleBotEventMessageUpdate<"poll">;
    dice: TeleBotEventMessageUpdate<"dice">;
    new_chat_members: TeleBotEventMessageUpdate<"new_chat_members">;
    left_chat_member: TeleBotEventMessageUpdate<"left_chat_member">;
    new_chat_title: TeleBotEventMessageUpdate<"new_chat_title">;
    new_chat_photo: TeleBotEventMessageUpdate<"new_chat_photo">;
    delete_chat_photo: TeleBotEventMessageUpdate<"delete_chat_photo">;
    group_chat_created: TeleBotEventMessageUpdate<"group_chat_created">;
    supergroup_chat_created: TeleBotEventMessageUpdate<"supergroup_chat_created">;
    channel_chat_created: TeleBotEventMessageUpdate<"channel_chat_created">;
    message_auto_delete_timer_changed: TeleBotEventMessageUpdate<"message_auto_delete_timer_changed">;
    migrate_to_chat_id: TeleBotEventMessageUpdate<"migrate_to_chat_id">;
    migrate_from_chat_id: TeleBotEventMessageUpdate<"migrate_from_chat_id">;
    pinned_message: TeleBotEventMessageUpdate<"pinned_message">;
    invoice: TeleBotEventMessageUpdate<"invoice">;
    successful_payment: TeleBotEventMessageUpdate<"successful_payment">;
    connected_website: TeleBotEventMessageUpdate<"connected_website">;
    passport_data: TeleBotEventMessageUpdate<"passport_data">;
    proximity_alert_triggered: TeleBotEventMessageUpdate<"proximity_alert_triggered">;
    voice_chat_started: TeleBotEventMessageUpdate<"voice_chat_started">;
    voice_chat_ended: TeleBotEventMessageUpdate<"voice_chat_ended">;
    voice_chat_participants_invited: TeleBotEventMessageUpdate<"voice_chat_participants_invited">;
    voice_chat_scheduled: TeleBotEventMessageUpdate<"voice_chat_scheduled">;
    // TelegramUpdateNames
    update: Update;
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
    my_chat_member: ChatMemberUpdated;
    chat_member: ChatMemberUpdated;
    chat_join_request: ChatJoinRequest;
    // TeleBot events
    error: SomeKindOfError;
};

export type TeleBotHearsName = string | RegExp;
export type TeleBotHearsContext<T extends TeleBotHearsName> = {
    match: T extends RegExp ? RegExpMatchArray : string;
};
export type TeleBotHearsPayload = TeleBotEventNames["text"];
export type TeleBotHearsProcessor<T extends TeleBotHearsName> = (payload: TeleBotHearsPayload, context: TeleBotHearsContext<T>) => Promise<unknown> | unknown;
export type TeleBotHears = {
    processors: Set<TeleBotHearsProcessor<TeleBotHearsName>>;
};

export type TeleBotEventName = keyof TeleBotEventNames;
export type TeleBotEventContext = Record<string, unknown>;
export type TeleBotEventPayload<T extends TeleBotEventName> = TeleBotEventNames[T];//Record<string, unknown> | SomeKindOfError;
export type TeleBotEventProcessor<T extends TeleBotEventName> = (payload: TeleBotEventNames[T], context?: TeleBotEventContext) => Promise<unknown> | unknown;
export type TeleBotEvent = {
    processors: Set<TeleBotEventProcessor<any>>;
};

export type TeleBotModifierName = TeleBotMethodName | keyof TeleBotEventNames | keyof TelegramUpdateKeys;
export type TeleBotModifierContext = Record<string, unknown>;
export type TeleBotModifierPayload = Record<string, unknown>;
export type TeleBotModifierProcessor<T extends TeleBotModifierName, P = any> = (payload: P, context?: TeleBotModifierContext) => Promise<P> | P;
export type TeleBotModifier = {
    processors: Set<TeleBotModifierProcessor<TeleBotModifierName>>;
};

export type TeleBotMethodName =
    "getMe" |
    "logOut" |
    "close" |
    "sendMessage" |
    "forwardMessage" |
    "copyMessage" |
    "sendPhoto" |
    "sendAudio" |
    "sendDocument" |
    "sendVideo" |
    "sendAnimation" |
    "sendVoice" |
    "sendVideoNote" |
    "sendMediaGroup" |
    "sendLocation" |
    "editMessageLiveLocation" |
    "stopMessageLiveLocation" |
    "sendVenue" |
    "sendContact" |
    "sendPoll" |
    "sendDice" |
    "sendChatAction" |
    "getUserProfilePhotos" |
    "getFile" |
    "getFileUrl" |
    "banChatMember" |
    "unbanChatMember" |
    "restrictChatMember" |
    "promoteChatMember" |
    "setChatAdministratorCustomTitle" |
    "exportChatInviteLink" |
    "createChatInviteLink" |
    "editChatInviteLink" |
    "revokeChatInviteLink" |
    "approveChatJoinRequest" |
    "declineChatJoinRequest" |
    "setChatPhoto" |
    "deleteChatPhoto" |
    "setChatTitle" |
    "setChatDescription" |
    "pinChatMessage" |
    "unpinChatMessage" |
    "unpinAllChatMessages" |
    "leaveChat" |
    "getChat" |
    "getChatAdministrators" |
    "getChatMemberCount" |
    "getChatMember" |
    "setChatStickerSet" |
    "deleteChatStickerSet" |
    "answerCallbackQuery" |
    "setMyCommands" |
    "getMyCommands" |
    "deleteMyCommands" |
    "editMessageText" |
    "editMessageCaption" |
    "editMessageMedia" |
    "editMessageReplyMarkup" |
    "stopPoll" |
    "deleteMessage" |
    "sendSticker" |
    "getStickerSet" |
    "uploadStickerFile" |
    "createNewStickerSet" |
    "addStickerToSet" |
    "setStickerPositionInSet" |
    "setStickerSetThumb" |
    "answerInlineQuery" |
    "sendInvoice" |
    "answerShippingQuery" |
    "answerPreCheckoutQuery" |
    "setPassportDataErrors" |
    "sendGame" |
    "setGameScore" |
    "getGameHighScores" |
    "setWebhook" |
    "deleteWebhook" |
    "getWebhookInfo" |
    "inlineKeyboard" |
    "replyKeyboard" |
    "replyKeyboardRemove" |
    "forceReply";

export type TeleBotPluginContext = Record<string, unknown>;

export type TeleBotPlugin<T = TeleBotPluginContext> = {
    id: string;
    name: string;
    version: string;
    author?: string;
    description?: string;
    homepage?: string;
    plugin(this: TeleBot, bot: TeleBot, context: T): void;
};
