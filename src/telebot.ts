import {
    TeleBotFlags,
    TeleBotOptions,
    TeleBotPolling,
    TeleBotRunningInstanceScenario,
    TeleBotScenario,
    TelegramFetchErrorScenario
} from "./types/telebot";
import { Message, TelegramBotToken, TelegramResponse, Update } from "./types/telegram";
import { ERROR_TELEBOT_ALREADY_RUNNING, TeleBotError } from "./errors";
import { TeleBotDevkit } from "./devkit";
import axios from "axios";
import { TeleBotEvents } from "./events";
import { updateProcessors } from "./processors";

const TELEGRAM_BOT_API = (botToken: string) => `https://api.telegram.org/bot${botToken}`;

export const DEFAULT_POLLING: TeleBotPolling = {
    offset: 0,
    interval: false,
    timeout: 0,
    limit: 100,
    allowedUpdates: undefined,
    retryTimeout: 3000,
    retryTimes: Infinity
};

export class TeleBot extends TeleBotEvents {
    private readonly botAPI: string;
    private readonly botToken: TelegramBotToken;

    public runningInstanceScenario: TeleBotRunningInstanceScenario = TeleBotScenario.Pass;
    public telegramFetchErrorScenario: TelegramFetchErrorScenario = TeleBotScenario.Reconnect;

    private polling: TeleBotPolling = DEFAULT_POLLING;

    private flags: TeleBotFlags = {
        isRunning: false,
        canFetch: true,
        waitEvents: false
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private lifeIntervalFn: any;

    private dev = new TeleBotDevkit("telebot");

    constructor(options: TeleBotOptions | TelegramBotToken) {
        super();

        if (typeof options === "string") {
            options = {
                token: options
            };
        }

        const {
            token,
            botAPI,
            polling
        } = options;

        this.botToken = token;

        if (!this.botToken) {
            throw new TeleBotError("Invalid Telegram bot token.");
        }

        this.botAPI = botAPI || TELEGRAM_BOT_API(this.botToken);

        if (polling) {
            const {
                offset,
                interval,
                timeout,
                limit,
                retryTimes,
                retryTimeout,
                allowedUpdates
            } = polling;

            if (offset !== undefined && Number.isInteger(offset)) {
                this.setOffset(offset);
            }

            if (interval !== undefined && interval > 0) {
                this.polling.interval = interval;
            }

            if (timeout !== undefined && timeout > 0) {
                this.polling.timeout = timeout;
            }

            if (limit !== undefined && limit > 0) {
                this.polling.limit = limit;
            }

            if (retryTimes !== undefined && Number.isInteger(retryTimes)) {
                this.polling.retryTimes = retryTimes;
            }

            if (retryTimeout !== undefined && Number.isInteger(retryTimeout)) {
                this.polling.retryTimeout = retryTimeout;
            }

            if (allowedUpdates !== undefined && Array.isArray(allowedUpdates) && allowedUpdates.length) {
                this.polling.allowedUpdates = allowedUpdates;
            }
        }

    }

    public getOptions() {
        return {
            polling: this.polling
        };
    }

    public start() {
        const {
            interval
        } = this.polling;

        // TODO: validate bot token by getMe() method

        if (!this.hasFlag("isRunning")) {
            this.setFlag("isRunning");
            try {
                if (interval && interval > 0) {
                    this.startLifeInterval(interval);
                } else {
                    this.startLifeCycle();
                }
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

    public getFlags(): TeleBotFlags {
        return this.flags;
    }

    public hasFlag<T extends keyof TeleBotFlags>(name: T): boolean {
        return this.flags[name];
    }

    public setFlag<T extends keyof TeleBotFlags>(name: T): void {
        this.dev.log("setFlag", name, "true");
        this.flags[name] = true;
    }

    public unsetFlag<T extends keyof TeleBotFlags>(name: T): void {
        this.dev.log("unsetFlag", name, "false");
        this.flags[name] = false;
    }

    private setOffset(offset: number): void {
        this.dev.log("setOffset", offset);
        this.polling.offset = offset;
    }

    private startLifeCycle(): void {
        this.dev.log("startLifeCycle");
        this.lifeCycle(false);
    }

    // TODO: WIP
    private startLifeInterval(interval: number): void {
        this.dev.log("startLifeInterval", interval);
        this.lifeIntervalFn = setInterval(() => {
            this.dev.log("interval cycle");
            if (this.hasFlag("isRunning") && this.hasFlag("canFetch")) {
                this.unsetFlag("canFetch");
                this.lifeCycle(true).then(() => {
                    this.setFlag("canFetch");
                }).catch((error: any) => {
                    this.dev.log("INTERVAL ERROR", error.message);
                });
            }
        }, interval);
    }

    private lifeCycle(liveOnce = true): any {
        this.dev.log("lifeCycle", { liveOnce });
        if (this.hasFlag("isRunning")) {
            const promise = this.fetchTelegramUpdates();
            return promise.then((data) => {
                this.dev.log("PROMISE OK", data);
                return liveOnce ? Promise.resolve() : this.lifeCycle(false);
            }).catch((error: any) => {
                this.dev.log("PROMISE ERROR", error.message);
                return Promise.reject(error);
            });
        } else {
            this.dev.log("lifeCycle", "not running");
            return Promise.resolve();
        }
    }

    private fetchTelegramUpdates(
        offset: number = this.polling.offset,
        limit: number = this.polling.limit,
        timeout: number = this.polling.timeout
    ) {
        this.dev.log("fetchTelegramUpdates");

        const promise = this.telegramRequest<any, Update[]>("getUpdates", { offset, limit, timeout });

        return promise.then((response) => {
            let processPromise: Promise<any> = Promise.resolve();

            this.dev.log("DONE", response.data);

            const { ok, result: updates } = response.data;

            if (ok && updates) {
                this.dev.log("OK");
                processPromise = this.processTelegramUpdates(updates);
            }

            return processPromise;
        }).catch((error: any) => {
            this.dev.log("ERROR", error.response.data);
            return Promise.reject(error);
        });
    }

    private processTelegramUpdates(updates: Update[]) {
        const processorPromises: Promise<any>[] = [];

        this.dev.log("processTelegramUpdates", updates.length);

        updates.forEach((update) => {
            for (const processorName in updateProcessors) {
                if (processorName in update) {
                    const updateData = update[processorName as keyof Update];
                    processorPromises.push((updateProcessors as any)[processorName].call(this, updateData, {}));
                    break;
                }
            }
        });

        return Promise.all(processorPromises).then(() => {
            if (updates.length > 0) {
                this.setOffset(++updates[updates.length - 1].update_id);
            }
        });
    }

    private telegramRequest<Request = {}, Response = {}>(endpoint: string, payload: Request) {
        const url = `${this.botAPI}/${endpoint}`;
        this.dev.log("telegramRequest", url, payload);
        return axios.request<TelegramResponse<Response>>({
            url,
            data: payload,
            method: "post",
            responseType: "json"
        });
    }

    public async telegramMethod<Response = Message>({
        method,
        required,
        optional
    }: {
        method: string;
        required?: any;
        optional?: any;
    }): Promise<Response> {
        const data = Object.assign({}, required, optional);
        const response = await this.telegramRequest<any, Response>(method, data);
        return response.data.result;
    }

}
