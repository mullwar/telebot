import {
    TeleBotFlags,
    TeleBotOptions,
    TeleBotPolling,
    TeleBotRunningInstanceScenario,
    TeleBotScenario
} from "./types/telebot";
import { TelegramBotToken } from "./types/telegram";
import { ERROR_TELEBOT_ALREADY_RUNNING, TeleBotError } from "./errors";

const TELEGRAM_BOT_API = (botToken: string) => `https://api.telegram.org/bot${botToken}`;

type TeleBotLifeCycle = Promise<void>;

export class TeleBot {
    private readonly botAPI: string;
    private readonly botToken: TelegramBotToken;

    public runningInstanceScenario: TeleBotRunningInstanceScenario = TeleBotScenario.Pass;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private lifeIntervalFn: any;

    constructor(options: TeleBotOptions | TelegramBotToken) {
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

    public start(): void {
        const {
            interval
        } = this.polling;

        if (!this.hasFlag("isRunning")) {
            this.setFlag("isRunning");
            try {
                const endOfLife = interval > 0 ? this.startLifeInterval(interval) : this.startLifeCycle();
                endOfLife.catch(() => {
                    // TODO: handle error
                }).finally(() => {
                    this.stop();
                });
            } catch (error) {
                throw new TeleBotError(error);
            }
        } else {
            switch (this.runningInstanceScenario) {
                case TeleBotScenario.Restart:
                    this.restart();
                    break;
                case TeleBotScenario.Terminate:
                    this.stop();
                    throw new TeleBotError(ERROR_TELEBOT_ALREADY_RUNNING);
                case TeleBotScenario.Pass:
                default:
                    break;
            }
        }

    }

    public restart(): void {
        this.stop();
        this.start();
    }

    public stop(): void {
        this.unsetFlag("isRunning");

        if (this.lifeIntervalFn) {
            clearInterval(this.lifeIntervalFn);
            this.lifeIntervalFn = undefined;
        }
    }

    public hasFlag<T extends keyof TeleBotFlags>(name: T): boolean {
        return this.flags[name];
    }

    public setFlag<T extends keyof TeleBotFlags>(name: T): void {
        this.flags[name] = true;
    }

    public unsetFlag<T extends keyof TeleBotFlags>(name: T): void {
        this.flags[name] = false;
    }

    private startLifeCycle(): TeleBotLifeCycle {
        return this.lifeCycle(false);
    }

    private startLifeInterval(interval: number): TeleBotLifeCycle {
        return new Promise((resolve, reject) => {
            this.lifeIntervalFn = setInterval(() => {
                if (this.hasFlag("isRunning")) {
                    if (this.hasFlag("canFetch")) {
                        this.unsetFlag("canFetch");
                        this.lifeCycle(true).then(() => {
                            this.setFlag("canFetch");
                        }).catch(reject);
                    }
                } else {
                    resolve();
                }
            }, interval);
        });
    }

    private async lifeCycle(liveOnce = true): TeleBotLifeCycle {
        if (this.hasFlag("isRunning")) {
            await new Promise((resolve) => {
                setTimeout(() => resolve(), 350);
            });
            return liveOnce ? Promise.resolve() : this.lifeCycle(false);
        } else {
            return Promise.resolve();
        }
    }

}
