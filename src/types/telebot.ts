export type TelegramBotToken = string;

export type TeleBotOptions = {
    token: TelegramBotToken;
    polling?: {
        limit?: number;
        interval?: number;
        timeout?: number;
        waitEvents?: boolean;
    };
} | TelegramBotToken;

export type TeleBotFlags = {
    isRunning: boolean;
    canFetch: boolean;
    waitEvents: boolean;
};

export type TeleBotPolling = {
    offset: number;
    timeout: number;
    interval: number;
    limit: number;
};
