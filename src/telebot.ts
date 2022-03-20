import axios from "axios";
import FormData from "form-data";
import { createReadStream, PathLike, ReadStream } from "fs";
import {
  TeleBotEvent,
  TeleBotEventContext,
  TeleBotEventName,
  TeleBotEventPayload,
  TeleBotEventProcessor,
  TeleBotFlags,
  TeleBotHears,
  TeleBotHearsContext,
  TeleBotHearsName,
  TeleBotHearsPayload,
  TeleBotHearsProcessor,
  TeleBotMethodName,
  TeleBotModifier,
  TeleBotModifierContext,
  TeleBotModifierName,
  TeleBotModifierPayload,
  TeleBotModifierProcessor,
  TeleBotOptions,
  TeleBotPlugin,
  TeleBotPluginContext,
  TeleBotPolling,
  WebhookOptions
} from "./types/telebot";
import {
  InputMedia,
  TelegramBotToken,
  TelegramResponse,
  TelegramUpdateNames,
  Update,
  User,
  WebhookInfo
} from "./types/telegram";
import { handleTelegramResponse, normalizeError, SomeKindOfError, TeleBotError } from "./errors";
import { Levels, LID, TeleBotLogger, TeleBotLogOptions } from "./telebot/logger";
import { TELEGRAM_UPDATE_PROCESSORS, TelegramUpdateProcessors } from "./telebot/processors";
import { ALLOWED_WEBHOOK_PORTS, craftWebhookPath, creteWebhookServer } from "./telebot/webhook";
import { convertToArray, parseUrl, randomId } from "./utils";
import { PropertyType } from "./types/utilites";

const TELEGRAM_BOT_API = (botToken: string) => `https://api.telegram.org/bot${botToken}`;

export const DEFAULT_POLLING: TeleBotPolling = {
  offset: 0,
  interval: false,
  timeout: 0,
  limit: 100,
  retryTimeout: 3000, // TODO
  retryTimes: Infinity // TODO
};

export const DEFAULT_DEBUG: TeleBotLogOptions = {
  levels: Object.values(Levels).filter(value => typeof value === "number") as Levels[]
};

export class TeleBot {
    private readonly botAPI: string;
    private readonly botToken: TelegramBotToken;

    private polling: TeleBotPolling = DEFAULT_POLLING;
    private readonly webhook?: WebhookOptions;
    private readonly proxy?: PropertyType<TeleBotOptions, "proxy">;

    private lifeIntervalFn: NodeJS.Timeout | undefined;
    private readonly allowedUpdates?: TelegramUpdateNames[];

    private readonly debug: PropertyType<TeleBotOptions, "log"> = false;

    private flags: TeleBotFlags = {
      isRunning: false,
      canFetch: true,
      waitEvents: false
    };

    public me?: User;
    public logger: TeleBotLogger;

    private events = new Map<TeleBotEventName, TeleBotEvent>();
    private hearsEvents = new Map<TeleBotHearsName, TeleBotHears>();
    private modifiers = new Map<TeleBotModifierName, TeleBotModifier>();
    private plugins = new Map<string, Omit<TeleBotPlugin, "plugin">>();

    constructor(options: TeleBotOptions | TelegramBotToken) {
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
        allowedUpdates,
        log
      } = options;

      if (log) {
        this.debug = log !== true ? log : DEFAULT_DEBUG;
      } else if (log === false) {
        this.debug = false;
      }

      this.logger = new TeleBotLogger("telebot", this.debug as TeleBotLogOptions);

      this.botToken = token;

      if (!this.botToken) {
        throw new TeleBotError("Telegram bot token is not provided.");
      }

      this.botAPI = botAPI ? botAPI(this.botToken) : TELEGRAM_BOT_API(this.botToken);

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

      } else if (webhook && typeof webhook !== "string") {
        const { url } = webhook;
        const { port, protocol } = parseUrl(url);
        const webhookPort = port ? parseInt(port) : 80;

        if (!protocol?.toLowerCase().startsWith("https")) {
          throw new TeleBotError(`Webhook "${url}" must be HTTPS secured.`);
        }

        if (!ALLOWED_WEBHOOK_PORTS.includes(webhookPort)) {
          throw new TeleBotError(`Webhook port "${webhookPort}" is not supported by Telegram Bot API. Use allowed webhook ports: ${ALLOWED_WEBHOOK_PORTS.join(", ")}`);
        }
      }

      if (allowedUpdates !== undefined && Array.isArray(allowedUpdates) && allowedUpdates.length) {
        this.allowedUpdates = allowedUpdates;
      }

      this.logger.debug(LID.Initial, {
        meta: {
          options: this.getOptions()
        }
      });

    }

    public getToken(): TelegramBotToken {
      return this.botToken;
    }

    public getOptions(): Omit<TeleBotOptions, "botAPI"> & { botAPI: string } {
      return {
        token: this.botToken,
        botAPI: this.botAPI,
        polling: this.polling,
        webhook: this.webhook,
        allowedUpdates: this.allowedUpdates
      };
    }

    public async start(): Promise<void | WebhookInfo> {
      const {
        interval
      } = this.polling;

      const webhook = this.webhook;

      if (!this.hasFlag("isRunning")) {
        this.setFlag("isRunning");
        try {
          this.me = await this.getMe();
          if (webhook) {
            if (typeof webhook === "string") {
              await this.setWebhook(webhook);
              return this.getWebhookInfo();
            } else {
              let url = webhook.url;
              if (webhook.serverHost && webhook.serverPort) {
                url = `https://${parseUrl(webhook.url).host}${craftWebhookPath(webhook.url, this.getToken())}`;
                await creteWebhookServer(this, webhook);
              }
              await this.setWebhook(url, {
                certificate: webhook.certificate,
                ip_address: webhook.ip_address,
                max_connections: webhook.max_connections,
                allowed_updates: webhook.allowed_updates || this.allowedUpdates,
                drop_pending_updates: webhook.drop_pending_updates
              });
              return this.getWebhookInfo();
            }

          } else if (interval && interval > 0) {
            await this.deleteWebhook();
            this.startLifeInterval(interval);
          } else if (interval === false) {
            await this.deleteWebhook();
            this.startLifeCycle();
          }
        } catch (e) {
          const error = normalizeError(e);
          this.dispatch("error", error);
          this.logger.error(LID.TeleBot, { error });
          this.stop();
          // eslint-disable-next-line no-console
          console.error("==== TELEBOT GLOBAL ERROR ====", error);
          return Promise.reject(error);
        }
      } else {
        this.stop();
        throw new TeleBotError("Telebot is already running. Terminate instance for safety.");
      }

    }

    public async restart(): Promise<unknown> {
      this.logger.info(LID.Restart);
      this.stop();
      return this.start();
    }

    public stop(): void {
      this.logger.info(LID.Stop);
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
      this.logger.debug(LID.SetFlag, { meta: { flag: name } });
      this.flags[name] = true;
    }

    public unsetFlag<T extends keyof TeleBotFlags>(name: T): void {
      this.logger.debug(LID.UnsetFlag, { meta: { flag: name } });
      this.flags[name] = false;
    }

    private setOffset(offset: number): void {
      this.logger.debug(LID.SetOffset, { meta: { offset } });
      this.polling.offset = offset;
    }

    private startLifeCycle(): void {
      this.logger.info(LID.StartLifeCycle);
      this.lifeCycle(false).catch((error: SomeKindOfError) => {
        this.logger.error(LID.StartLifeCycle, { error });
        this.dispatch("error", error);
      });
    }

    private startLifeInterval(interval: number): void {
      this.logger.info(LID.StartLifeInterval, {
        meta: { interval }
      });
      this.lifeIntervalFn = setInterval(() => {
        this.logger.debug(LID.LiveInterval);
        if (this.hasFlag("isRunning") && this.hasFlag("canFetch")) {
          this.unsetFlag("canFetch");
          this.lifeCycle(true).then(() => {
            this.setFlag("canFetch");
          }).catch((error: SomeKindOfError) => {
            this.dispatch("error", error);
            this.logger.error(LID.StartLifeInterval, { error });
          });
        }
      }, interval);
    }

    private lifeCycle(liveOnce = true): Promise<void> {
      this.logger.debug(LID.Tick);
      if (this.hasFlag("isRunning")) {
        return this.fetchTelegramUpdates().then(() => {
          return liveOnce ? Promise.resolve() : this.lifeCycle(false);
        }).catch((e) => {
          const error = normalizeError(e);
          this.logger.error(LID.LifeCycle, { error });
          return Promise.reject(error);
        });
      } else {
        this.logger.debug(LID.LifeCycle, "not running");
        return Promise.resolve();
      }
    }

    private fetchTelegramUpdates(
      offset: number = this.polling.offset,
      limit: number = this.polling.limit,
      timeout: number = this.polling.timeout
    ) {
      this.logger.debug(LID.FetchTelegramUpdates, {
        meta: { offset, limit, timeout }
      });
      const promise = this.telegramRequest<unknown, Update[]>("getUpdates", { offset, limit, timeout });
      return promise.then((updates: Update[]) => {
        let processPromise: Promise<unknown> = Promise.resolve();
        this.logger.debug(LID.FetchTelegramUpdates, {
          meta: { updates }
        });
        if (updates) {
          processPromise = this.processTelegramUpdates(updates);
        }
        return processPromise.then(() => {
          if (updates && updates.length > 0) {
            this.setOffset(++updates[updates.length - 1].update_id);
          }
        });
      }).catch((e) => {
        const error = normalizeError(e);
        this.logger.error(LID.FetchTelegramUpdates, { error });
        return Promise.reject(error);
      });
    }

    public async processTelegramUpdates(updates: Update[]): Promise<unknown> {
      const processorPromises: Promise<unknown>[] = [];
      this.logger.info(LID.ProcessTelegramUpdates, {
        meta: { updates }
      });
      for (const update of updates) {
        const updatePayload = await this.run("update", update);
        processorPromises.push(TELEGRAM_UPDATE_PROCESSORS["update"].call(this, updatePayload, {}));
        for (const name of Object.keys(TELEGRAM_UPDATE_PROCESSORS)) {
          const processorName = name as TelegramUpdateProcessors;
          if (processorName !== "update" && processorName in update) {
            const payload = await this.run(processorName, updatePayload[processorName]);
            if (payload) {
              processorPromises.push(TELEGRAM_UPDATE_PROCESSORS[processorName].call(this, payload, {}));
            }
            break;
          }
        }
      }

      return this.flags.waitEvents ? Promise.all(processorPromises) : Promise.resolve(processorPromises);
    }

    public telegramRequest<Request = Record<string, unknown>, Response = Record<string, unknown>>(endpoint: string, payload: Request): Promise<Response> {
      const url = `${this.botAPI}/${endpoint}`;
      this.logger.info(LID.TelegramRequest, {
        meta: { endpoint, payload }
      });
      return axios.request<TelegramResponse<Response>>({
        url,
        headers: payload instanceof FormData ? payload.getHeaders() : undefined,
        data: payload,
        method: "post",
        responseType: "json",
        maxContentLength: payload instanceof FormData ? Infinity : undefined,
        proxy: this.proxy
      })
        .then((response) => {
          const { ok, result } = response.data;
          this.logger.http(LID.TelegramResponse, {
            meta: { response: response.data }
          });
          if (!ok || result === undefined) {
            return Promise.reject(response.data);
          }
          return result;
        })
        .catch((e) => {
          const error = handleTelegramResponse(e);
          this.logger.error(LID.TelegramRequest, { error });
          return Promise.reject(error);
        });

    }

    public async telegramMethod<T>({
      method,
      required = {},
      optional = {},
      isDataForm
    }: {
        method: TeleBotMethodName;
        required?: Record<string, any>;
        optional?: Record<string, any>;
        isDataForm?: boolean;
    }): Promise<T> {

      const { required: modifiedRequired, optional: modifiedOptional } = await this.run(
        method, { required, optional }, { method, required, optional, isDataForm }
      );
      let payload = Object.assign({}, modifiedRequired, modifiedOptional);
      if (isDataForm) {
        const form = new FormData();
        for (const [key, value] of Object.entries(payload)) {
          let payload = value;
          if (Array.isArray(value)) {
            const data = value.map((inputMedia: InputMedia) => {
              if (inputMedia.media instanceof ReadStream) {
                const fileId = randomId();
                form.append(fileId, inputMedia.media);
                inputMedia.media = `attach://${fileId}`;
              }
              return inputMedia;
            });
            payload = JSON.stringify(data);
          }
          form.append(key, payload);
        }
        payload = form;
      }

      this.logger.debug(LID.TelegramMethod, {
        meta: { method, required, optional }
      });

      return this.telegramRequest<any, T>(method, payload);
    }

    public uploadFile(path: PathLike): ReadStream {
      return createReadStream(path);
    }

    public parallel<T = unknown>(tasks: Promise<T>[]): Promise<T[]> {
      return Promise.all(tasks);
    }

    public plugin<T extends TeleBotPluginContext>(plugin: TeleBotPlugin<T>, context: T): void {
      this.logger.info(LID.Plugin, { meta: plugin });
      if (!this.plugins.get(plugin.id)) {
        this.plugins.set(plugin.id, {
          id: plugin.id,
          name: plugin.name,
          version: plugin.version,
          author: plugin.author,
          description: plugin.description,
          homepage: plugin.homepage
        });
        plugin.plugin.call(this, this, context);
      }
    }

    public hears<T extends TeleBotHearsName>(text: T | T[], processor: TeleBotHearsProcessor<T>): void {
      this.logger.debug(LID.Hears, {
        meta: { on: text }
      });
      for (const value of convertToArray(text)) {
        const handler = this.hearsEvents.get(value);
        if (handler) {
          handler.processors.add(processor);
        } else {
          this.hearsEvents.set(value, {
            processors: new Set([processor])
          });
        }
      }
    }

    public dispatchHears(text: string, payload: TeleBotHearsPayload): Promise<unknown[]> {
      this.logger.debug(LID.Hears, {
        meta: { dispatch: text }
      });
      const eventPromise: Promise<unknown>[] = [];
      for (const textValue of convertToArray(text)) {
        for (const hearsEvent of this.hearsEvents.keys()) {
          let match: PropertyType<TeleBotHearsContext<TeleBotHearsName>, "match"> | null = textValue;
          if (hearsEvent instanceof RegExp) {
            match = textValue.match(hearsEvent);
            if (!match) {
              continue;
            }
          } else if (hearsEvent !== textValue) {
            continue;
          }
          const eventHandler = this.hearsEvents.get(hearsEvent)!;
          for (const processor of eventHandler.processors) {
            eventPromise.push(new Promise<unknown>((resolve) => {
              try {
                const processorOutput = processor.call(this, payload, { match: match! });
                if (processorOutput instanceof Promise) {
                  processorOutput.then(resolve).catch((e) => {
                    const error = normalizeError(e, payload);
                    this.logger.error(LID.DispatchHears, { error });
                    this.dispatch("error", error, { methodName: textValue });
                    resolve(error);
                  });
                } else {
                  resolve(processorOutput);
                }
              } catch (e) {
                const error = normalizeError(e, payload);
                this.logger.error(LID.DispatchHears, { error });
                this.dispatch("error", error, { methodName: textValue });
                resolve(error);
              }
            }));
          }
        }
      }
      return this.flags.waitEvents ? Promise.all(eventPromise) : Promise.resolve(eventPromise);
    }

    public mod<T extends TeleBotModifierName>(name: T, processor: TeleBotModifierProcessor<T>): void {
      this.logger.debug(LID.Modifier, {
        meta: { name }
      });
      const eventHandler = this.modifiers.get(name);
      if (eventHandler) {
        eventHandler.processors.add(processor);
      } else {
        this.modifiers.set(name, {
          processors: new Set([processor])
        });
      }
    }

    public async run<T extends TeleBotModifierName, P = TeleBotModifierPayload>(event: T, payload: P, context?: TeleBotModifierContext): Promise<P> {
      this.logger.debug(LID.Modifier, {
        meta: { run: event }
      });
      const handler = this.modifiers.get(event);
      if (handler) {
        for (const processor of handler.processors) {
          payload = await processor.call(this, payload, context);
        }
      }
      return payload;
    }

    public on<T extends TeleBotEventName>(event: T | T[], processor: TeleBotEventProcessor<T>): void {
      this.logger.debug(LID.Event, {
        meta: { on: event }
      });
      for (const eventName of convertToArray(event)) {
        const eventHandler = this.events.get(eventName);
        if (eventHandler) {
          eventHandler.processors.add(processor);
        } else {
          this.events.set(eventName, {
            processors: new Set([processor])
          });
        }
      }
    }

    public dispatch<T extends TeleBotEventName, P = TeleBotEventPayload<T>>(event: T | T[], payload?: P, context: TeleBotEventContext = {}): Promise<unknown> {
      this.logger.debug(LID.Event, {
        meta: { dispatch: event }
      });
      const eventPromise: Promise<unknown>[] = [];
      for (const eventName of convertToArray(event)) {
        const eventHandler = this.events.get(eventName);
        if (!eventHandler) {
          continue;
        }
        const eventContext = { eventName, ...context };
        for (const processor of eventHandler.processors) {
          eventPromise.push(new Promise<unknown>((resolve) => {
            try {
              const processorOutput = processor.call(this, payload, eventContext);
              if (processorOutput instanceof Promise) {
                processorOutput.then(resolve).catch((e) => {
                  const error = normalizeError(e, payload);
                  this.logger.error(LID.Dispatch, { error });
                  if (eventName !== "error") {
                    this.dispatch("error", error, eventContext);
                  } else {
                    // TODO: Error in error processor
                    console.log("ASYNC EVENT ERROR", error, eventContext);
                  }
                  resolve(error);
                });
              } else {
                resolve(processorOutput);
              }
            } catch (e) {
              const error = normalizeError(e, payload);
              this.logger.error(LID.Dispatch, { error });
              if (eventName !== "error") {
                this.dispatch("error", error, eventContext);
              } else {
                // TODO: Error in error processor
                console.log("SYNC EVENT ERROR", error, eventContext);
              }
              resolve(error);
            }
          }));
        }
      }
      return this.flags.waitEvents ? Promise.all(eventPromise) : Promise.resolve(eventPromise);
    }

}
