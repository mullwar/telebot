import { TelegramErrorResponse } from "./types/telegram";
import { AxiosError, AxiosResponse, Method } from "axios";

export const ERROR_TELEBOT_MAXIMUM_RETRY = "Maximum retries exceeded. Terminate instance for safety."; // TODO

export type SomeKindOfError = TeleBotError | TelegramError | Error | EvalError | RangeError | ReferenceError |
    SyntaxError | TypeError | URIError;

export class TeleBotError<T = unknown> extends Error {
    name = "TeleBotError";
    payload?: T;

    constructor(message: string, payload?: T) {
        super(message);
        this.payload = payload;
    }
}

export class TelegramError<T = unknown> extends Error {
    name = "TelegramError";
    request: {
        url?: string;
        method?: Method;
        data?: T;
    };
    response: TelegramErrorResponse;

    constructor(response: AxiosResponse<TelegramErrorResponse>) {
        super(`${response.status} - ${response.statusText}`);
        const { url, method, data } = response.config;
        this.request = { url, method, data };
        this.response = response.data;
    }
}

export function handleTelegramResponse(error: any): SomeKindOfError {
    if (error.isAxiosError) {
        const { response } = (error as AxiosError<TelegramErrorResponse>);
        if (response) {
            return new TelegramError(response);
        }
    }
    return normalizeError(error);
}

export function normalizeError(error: any, payload?: unknown): SomeKindOfError {
    if (!(error instanceof Error)) {
        error = new TeleBotError(error);
    }
    if (payload) {
        error.payload = payload;
    }
    return error;
}
