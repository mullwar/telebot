import {
    TeleBotFlags, TeleBotOptions, TeleBotPolling, TelegramBotToken
} from "./types/telebot";

const TELEGRAM_BOT_API = (botToken: string) => `https://api.telegram.org/bot${botToken}`;

class TeleBotError extends Error {

}

class TeleBot {
    private readonly botAPI: string;
    private readonly botToken: TelegramBotToken;

    private polling: TeleBotPolling = {
        offset: 0,
        timeout: 0,
        interval: 0,
        limit: 100
    };

    private flags: TeleBotFlags = {
        isRunning: false,
        canFetch: true,
        waitEvents: false
    };

    constructor(options: TeleBotOptions) {
        if (typeof options === "string") {
            options = {
                token: options
            };
        }

        const {
            token,
            polling
        } = options;

        this.botToken = token;

        if (!this.botToken) {
            throw new TeleBotError("Invalid Telegram bot token.");
        }

        this.botAPI = TELEGRAM_BOT_API(this.botToken);

        if (polling) {
            const {
                interval,
                waitEvents
            } = polling;

            if (waitEvents === true) {
                this.setFlag("waitEvents");
            }

            if (interval && interval > 0) {
                this.polling.interval = interval;
            }
        }

    }

    public hasFlag<T extends keyof TeleBotFlags>(name: T) {
        return this.flags[name];
    }

    public setFlag<T extends keyof TeleBotFlags>(name: T) {
        this.flags[name] = true;
    }

    public unsetFlag<T extends keyof TeleBotFlags>(name: T) {
        this.flags[name] = false;
    }

}

export = TeleBot;
