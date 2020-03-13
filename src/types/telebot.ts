import { TelegramBotToken } from "./telegram";

export type TeleBotOptions = {
    token: TelegramBotToken;
    polling?: {
        limit?: number;
        interval?: number;
        timeout?: number;
        waitEvents?: boolean;
    };
};

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

export enum TeleBotScenario {
    Restart = "restart",
    Terminate = "terminate",
    Pass = "pass"
}

export type TeleBotRunningInstanceScenario = TeleBotScenario;
