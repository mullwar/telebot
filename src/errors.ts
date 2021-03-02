import { TelegramErrorResponse } from "./types/telegram";
import { AxiosError, AxiosResponse, Method } from "axios";

export const ERROR_TELEBOT_ALREADY_RUNNING = "Telebot is already running. Terminate instance for safety.";
export const ERROR_TELEBOT_MAXIMUM_RETRY = "Maximum retries exceeded. Terminate instance for safety.";

export class TeleBotError<T = Record<string, unknown>> extends Error {
    name = "TeleBotError";
    payload: T;

    constructor(error: string, payload?: T) {
        super(error);
        this.message = error;
        this.payload = payload || {} as T;
    }
}

export class TelegramError extends Error {
    name = "TelegramError";
    request: {
        url?: string;
        method?: Method;
        data?: any;
    };
    response: TelegramErrorResponse;
    payload: Record<string, unknown> = {};

    constructor(response: AxiosResponse<TelegramErrorResponse>) {
        super(`${response.status} - ${response.statusText}`);
        const { url, method, data } = response.config;
        this.request = { url, method, data };
        this.response = response.data;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleTelegramResponse(error: any) {
    if (error.isAxiosError) {
        const { response } = (error as AxiosError<TelegramErrorResponse>);
        if (response) {
            return new TelegramError(response);
        }
    }
    return error;
}
