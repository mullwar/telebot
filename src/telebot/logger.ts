import { PropertyType } from "../types/utilites";
import { toString } from "../utils";
import { SomeKindOfError } from "../errors";

export const LID = {
    Initial: "Initial",
    TeleBot: "TeleBot",
    Tick: "Tick",
    Pass: "Pass",
    Stop: "Stop",
    Restart: "Restart",
    SetFlag: "SetFlag",
    UnsetFlag: "UnsetFlag",
    SetOffset: "SetOffset",
    StartLifeCycle: "StartLifeCycle",
    StartLifeInterval: "StartLifeInterval",
    LiveInterval: "LiveInterval",
    LifeCycle: "LifeCycle",
    FetchTelegramUpdates: "FetchTelegramUpdates",
    ProcessTelegramUpdates: "ProcessTelegramUpdates",
    TelegramRequest: "TelegramRequest",
    TelegramMethod: "TelegramMethod",
    Plugin: "Plugin",
    Event: "Event",
    Modifier: "Modifier",
    Dispatch: "Dispatch",
    Hears: "Hears",
    DispatchHears: "DispatchHears",
    Webhook: "Webhook",
    Error: "Error"
};

export enum Levels {
    error = "error",
    warn = "warn",
    log = "log",
    http = "http",
    info = "info",
    debug = "debug"
}

export type TeleBotLog = {
    id: string;
    level: Levels;
    code?: number | string;
    message?: string;
    meta?: Record<string, unknown>;
    error?: SomeKindOfError | Record<string, unknown>;
};

export type TeleBotLogOptions = false | {
    levels?: Levels[];
    ids?: Array<keyof typeof LID | string>;
    logger?(log: TeleBotLog): void;
};

export class TeleBotLogger {
    private readonly id: string;
    private readonly options: TeleBotLogOptions;

    constructor(id: string, options: TeleBotLogOptions) {
        this.id = id;
        this.options = options;
    }

    public logger(log: TeleBotLog): void {
        if (!this.options) {
            return;
        }

        const {
            id,
            code,
            level = Levels.debug,
            meta,
            message,
            error
        } = log;

        const { ids, levels } = this.options;

        if ((ids && !ids.includes(id)) || (levels && !levels.includes(level))) {
            return;
        }

        if (this.options?.logger) {
            return this.options.logger.call(this, log);
        }

        const t = new Date();
        const logId = [id, code].filter(i => !!i && i !== 0).join(":");
        const text = [message || toString(meta), error].filter(i => !!i).join(" ");

        // eslint-disable-next-line no-console
        console.log(`[${t.toLocaleString("en-GB")}] ${level}: ${logId} ${text}`);
    }

    private createProcessor(level: Levels) {
        return (
            id: PropertyType<TeleBotLog, "id">,
            props?: PropertyType<TeleBotLog, "message"> | Omit<TeleBotLog, "id" | "level" | "message"> &
                { message?: string }
        ) => {
            if (typeof props === "string") {
                props = { message: props };
            } else if (props?.meta) {
                props.message = toString(props?.meta);
            }
            this.logger({
                ...props,
                id,
                level
            });
        };
    }

    public error = this.createProcessor(Levels.error);
    public warn = this.createProcessor(Levels.warn);
    public http = this.createProcessor(Levels.http);
    public log = this.createProcessor(Levels.log);
    public info = this.createProcessor(Levels.info);
    public debug = this.createProcessor(Levels.debug);
}
