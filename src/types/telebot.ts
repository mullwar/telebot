import { Message, TelegramBotToken } from "./telegram";
import { RequireFields } from "./utilites";

export type TeleBotOptions = {
    token: TelegramBotToken;
    botAPI?: string;
    polling?: Partial<TeleBotPolling>;
    // scenarios?: {
    //     onRunningInstanceStart?: TeleBotRunningInstanceScenario;
    //     onTelegramFetchError?: TelegramFetchErrorScenario;
    // };
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
    allowedUpdates: string[] | undefined;
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
    game: RequireFields<Message, "game">;
    photo: RequireFields<Message, "photo">;
    sticker: RequireFields<Message, "sticker">;
    voice: RequireFields<Message, "voice">;
    videoNote: RequireFields<Message, "video_note">;
    location: RequireFields<Message, "location">;
    poll: RequireFields<Message, "poll">;
    venue: RequireFields<Message, "venue">;
};

export type TeleBotEventProcessorContext = {
    unsubscribe: Function;
};

export type TeleBotEventProcessor<T extends keyof TeleBotEventNames> = (data: TeleBotEventNames[T], context: TeleBotEventProcessorContext) => any;

