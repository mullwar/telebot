import { ResponseParameters, TelegramErrorResponse } from "./types/telegram";
import { AxiosError, AxiosResponse, Method } from "axios";

export const ERROR_TELEBOT_ALREADY_RUNNING = "Telebot is already running. Terminate instance for safety.";
export const ERROR_TELEBOT_MAXIMUM_RETRY = "Maximum retries exceeded. Terminate instance for safety.";

export class TeleBotError<T = {}> extends Error {
    name = "TeleBotError";
    data: T;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(error: string, data?: T) {
        super(error);
        this.message = error;
        this.data = data || {} as T;
    }
}

export class TelegramError extends Error {
    name = "TelegramError";
    code: number;
    description: string;
    parameters?: ResponseParameters;

    constructor({ error_code, description, parameters }: TelegramErrorResponse) {
        super(`${error_code}: ${description}`);
        this.code = error_code;
        this.description = description;
        this.parameters = parameters;
    }
}

export class TeleBotRequestError extends Error {
    name = "TeleBotRequestError";
    request: {
        url?: string;
        method?: Method;
        data?: any;
    };
    response: TelegramErrorResponse;

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
            return new TeleBotRequestError(response);
        }
    }
    return error;
}
