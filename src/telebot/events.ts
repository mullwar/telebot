import { convertToArray } from "../utils";
import { TeleBotEventNames, TeleBotEventProcessor } from "../types/telebot";

type TeleBotEvent = {
    processors: Set<any>;
};

export type EventType = string;
export type EventTypes = EventType | EventType[];
export type ComplexEventType = EventType;
export type ComplexEvents = ComplexEventType | ComplexEventType[];

export class TeleBotEvents {
    private events = new Map<string, TeleBotEvent>();

    public on<T extends keyof TeleBotEventNames>(event: T | T[], processor: TeleBotEventProcessor<T>): TeleBotEventProcessor<T> {
        const events = convertToArray<T>(event);
        events.forEach((key) => {
            const eventHandler = this.events.get(key);
            if (eventHandler) {
                eventHandler.processors.add(processor);
            } else {
                this.events.set(key, {
                    processors: new Set([processor])
                });
            }
        });
        return processor;
    }

    public dispatch<T>(event: EventTypes, data?: any) {
        return this._dispatch<T>("", event, data);
    }

    public off(processor: TeleBotEventProcessor<any>): void {
        return undefined;
    }

    private _dispatch<T>(storageId: string, events: ComplexEvents, data?: any, context?: {}) {
        const storage = this.events;
        const promises: Promise<any>[] = [];

        events = convertToArray<any>(events);

        events.forEach((name) => {
            const handler = storage.get(name);
            if (handler) {
                for (const processor of handler.processors) {
                    promises.push(new Promise((resolve, reject) => {
                        const result = processor.call(this, data, {
                            unsubscribe: this.off.bind(this, processor),
                            ...context
                        });
                        if (result instanceof Promise) {
                            result.then(resolve).catch(reject);
                        } else {
                            resolve(result);
                        }
                    }));
                }
            }
        });

        return Promise.all(promises);
    }

}
