export const ERROR_TELEBOT_ALREADY_RUNNING = "Telebot is already running. Terminate instance for safety.";
export const ERROR_TELEBOT_MAXIMUM_RETRY = "Maximum retries exceeded. Terminate instance for safety.";

export class TeleBotError extends Error {
    name = "TeleBotError";
}

export class TelegramError extends Error {
    name = "TelegramError";
}
