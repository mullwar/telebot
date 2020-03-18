import axios from "axios";
import {
    TeleBotFlags,
    TeleBotOptions,
    TeleBotPolling,
    TeleBotRunningInstanceScenario,
    TeleBotScenario,
    TelegramFetchErrorScenario,
    WebhookOptions
} from "./types/telebot";
import { Message, TelegramBotToken, TelegramResponse, Update, UpdateTypes, User } from "./types/telegram";
import { ERROR_TELEBOT_ALREADY_RUNNING, handleTelegramResponse, TeleBotError, TeleBotRequestError } from "./errors";
import { TeleBotDevkit } from "./telebot/devkit";
import { TeleBotEvents } from "./telebot/events";
import { updateProcessors } from "./telebot/processors";
import { allowedWebhookPorts, webhookServer } from "./telebot/webhook";
import { parseUrl } from "./utils";

const TELEGRAM_BOT_API = (botToken: string) => `https://api.telegram.org/bot${botToken}`;

export const DEFAULT_POLLING: TeleBotPolling = {
    offset: 0,
    interval: false,
    timeout: 0,
    limit: 100,
    retryTimeout: 3000,
    retryTimes: Infinity
};

export class TeleBot extends TeleBotEvents {
    private readonly botAPI: string;
    private readonly botToken: TelegramBotToken;

    private polling: TeleBotPolling = DEFAULT_POLLING;
    private readonly webhook?: WebhookOptions;

    private lifeIntervalFn: NodeJS.Timeout | undefined;
    private readonly allowedUpdates: UpdateTypes = [];

    private flags: TeleBotFlags = {
        isRunning: false,
        canFetch: true,
        waitEvents: false
    };

    public me: User | undefined;

    public runningInstanceScenario: TeleBotRunningInstanceScenario = TeleBotScenario.Pass;
    public telegramFetchErrorScenario: TelegramFetchErrorScenario = TeleBotScenario.Reconnect;

    public dev = new TeleBotDevkit("telebot");

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
            polling,
            webhook,
            allowedUpdates
        } = options;

        this.botToken = token;

        if (!this.botToken) {
            throw new TeleBotError("Telegram bot token is not provided.");
        }

        this.botAPI = botAPI || TELEGRAM_BOT_API(this.botToken);

        this.webhook = webhook;

        if (polling) {
            const {
                offset,
                interval,
                timeout,
                limit,
                retryTimes,
                retryTimeout
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

        } else if (webhook) {

            const { url } = webhook;
            const { port: urlPort, protocol } = parseUrl(url);
            const webhookPort = urlPort ? parseInt(urlPort) : 80;
            const isHttps = protocol?.toLowerCase().startsWith("https");

            if (!isHttps) {
                throw new TeleBotError(`Webhook '${url}' must be HTTPS secured.`);
            }

            if (!allowedWebhookPorts.includes(webhookPort)) {
                throw new TeleBotError(`Webhook port of '${webhookPort}' is not supported by Telegram Bot API. Use allowed webhook ports: ${allowedWebhookPorts.join(", ")}`);
            }

            // if (host) {
            //     throw new TeleBotError("Webhook host is required.");
            // }
            //
            // if (!port || !Number.isInteger(port) || port <= 0) {
            //     throw new TeleBotError(`Invalid webhook port: '${port}'`);
            // }

        }

        if (allowedUpdates !== undefined && Array.isArray(allowedUpdates) && allowedUpdates.length) {
            this.allowedUpdates = allowedUpdates;
        }

    }

    public getToken(): TelegramBotToken {
        return this.botToken;
    }

    public getOptions(): TeleBotOptions {
        return {
            token: this.botToken,
            botAPI: this.botAPI,
            polling: this.polling,
            webhook: this.webhook,
            allowedUpdates: this.allowedUpdates
        };
    }

    public async start() {
        const {
            interval
        } = this.polling;

        const webhook = this.webhook;

        try {
            this.me = await this.getMe();
        } catch (error) {
            if (error instanceof TeleBotRequestError) {
                if (error.response.error_code === 401) {
                    return new TeleBotError("Incorrect Telegram Bot token.");
                }
            }
            return error;
        }

        if (!this.hasFlag("isRunning")) {
            this.setFlag("isRunning");
            try {
                const deleteWebhook = async () => await this.deleteWebhook();
                if (webhook) {
                    const url = `${webhook.url}/${this.getToken()}`;
                    await this.setWebhook(url, {
                        certificate: webhook.cert
                    });
                    if (webhook.host && webhook.port) {
                        webhookServer(this, webhook);
                    }
                    // this.setWebhook(url, {
                    //     certificate: webhook.cert
                    // }).then((re) => {
                    //     this.dev.log("webhook", `set to "${url}"`, re);
                    //     return webhookServer(this, webhook);
                    // }).finally(() => {
                    //     this.dev.log("STOP WEBHOOK");
                    //     this.stop();
                    // });
                } else if (interval && interval > 0) {
                    await deleteWebhook();
                    this.startLifeInterval(interval);
                } else if (interval === false) {
                    await deleteWebhook();
                    this.startLifeCycle();
                }

            } catch (error) {
                const e = error;
                // eslint-disable-next-line no-console
                console.error("==== TELEBOT GLOBAL ERROR ====", e);
                return e;
            }

        } else {
            switch (this.runningInstanceScenario) {
                case TeleBotScenario.Restart:
                    await this.restart();
                    break;
                case TeleBotScenario.Terminate:
                    await this.stop();
                    throw new TeleBotError(ERROR_TELEBOT_ALREADY_RUNNING);
                case TeleBotScenario.Pass:
                default:
                    break;
            }
        }

    }

    public async restart(): Promise<void> {
        await this.stop();
        return await this.start();
    }

    public async stop(): Promise<void> {
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
        return this.lifeCycle(false);
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
                this.dev.log("PROMISE ERROR", error);
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

        return promise.then((updates) => {
            let processPromise: Promise<any> = Promise.resolve();

            this.dev.log("UPDATES", updates);

            if (updates) {
                processPromise = this.processTelegramUpdates(updates);
            }

            return processPromise.then(() => {
                if (updates && updates.length > 0) {
                    this.setOffset(++updates[updates.length - 1].update_id);
                }
            });
        }).catch((error: any) => {
            this.dev.log("ERROR", error);
            return Promise.reject(error);
        });
    }

    public processTelegramUpdates(updates: Update[]) {
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

        return Promise.all(processorPromises);
    }

    private telegramRequest<Request = {}, Response = {}>(endpoint: string, payload: Request): Promise<Response> {
        const url = `${this.botAPI}/${endpoint}`;
        this.dev.log("telegramRequest --->", url, payload);
        return axios.request<TelegramResponse<Response>>({
            url,
            data: payload,
            method: "post",
            responseType: "json"
        })
            .then((response) => {
                const { ok, result } = response.data;
                this.dev.log("telegramRequest <---", response.data);
                if (!ok || result === undefined) {
                    return Promise.reject(response.data);
                }
                return result;
            })
            .catch((error) => {
                const e = handleTelegramResponse(error);
                this.dev.log("telegramRequest <-/-", e);
                return Promise.reject(e);
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
        // this.dev.log("telegramMethod", method, data);
        return this.telegramRequest<any, Response>(method, data);
    }

}
