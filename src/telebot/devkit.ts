import { PropertyType } from "../types/utilites";
import { toString } from "../utils";

export type TeleBotDevOptions = false | {
    levels?: Levels[];
    ids?: string[];
};

export type TeleBotDevLog = {
    id: number | string;
    level?: Levels;
    code?: number | string;
    message?: number | string;
    data?: Record<string, any>;
    error?: Record<string, unknown>;
};

export enum Levels {
    fatal,
    error,
    warn,
    log,
    info,
    debug
}

// export const Types = {
//     fatal: "#",
//     error: "!",
//     warn: "%",
//     log: "",
//     info: "?",
//     debug: "@"
// };

export class TeleBotDev {
    private readonly id: string;
    private readonly instance: Record<string, unknown>;
    private readonly options: TeleBotDevOptions;

    private logs: TeleBotDevLog[] = [];
    private logLimit = 1024;

    constructor(id: string, instance: Record<string, any>, options: TeleBotDevOptions) {
        this.id = id;
        this.instance = instance;
        this.options = options;
    }

    public logger(log: TeleBotDevLog): void {
        if (!this.options) {
            return;
        }

        const {
            id,
            data,
            code,
            level = Levels.debug,
            message = toString(data),
            error
        } = log;

        const { ids, levels } = this.options;

        if (
            (ids && !ids.includes(id.toString())) ||
            (levels && !levels.includes(level))
        ) {
            return;
        }

        if (this.logs.length > this.logLimit) {
            this.logs.shift();
        }

        this.logs.push(log);

        const logId = [id, level, code].filter(i => !!i && i !== 0).join(":");
        const timestamp = Date.now();
        const text = [message, error].filter(i => !!i).join(" ");

        // eslint-disable-next-line no-console
        console.log(`[${timestamp}] <${logId}> ${text}`);
    }

    private createProcessor(level: Levels) {
        return (
            id: PropertyType<TeleBotDevLog, "id">,
            props?: PropertyType<TeleBotDevLog, "message"> |
                Omit<TeleBotDevLog, "id" | "level" | "message"> & { message?: any }
        ) => {
            if (typeof props === "string" || typeof props === "number") {
                props = { message: props };
            } else if (props?.message) {
                props.message = toString(props.message);
            }
            this.logger({
                ...props,
                id,
                level
            });
        };
    }

    public debug = this.createProcessor(Levels.debug);
    public info = this.createProcessor(Levels.info);
    public log = this.createProcessor(Levels.log);
    public warn = this.createProcessor(Levels.warn);
    public fatal = this.createProcessor(Levels.fatal);
    public error = this.createProcessor(Levels.error);

}
