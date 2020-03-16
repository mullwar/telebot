import { TeleBot } from "../telebot";
import { Message } from "../types/telegram";

const messageTypes = [
    "text",
    "photo",
    "document"
];

export const updateProcessors = {
    message(this: TeleBot, messageUpdate: Message): Promise<any> {
        const processorPromises: Promise<any>[] = [];
        for (const messageType of messageTypes) {
            if (messageType in messageUpdate) {
                processorPromises.push(this.dispatch(messageType, messageUpdate));
                break;
            }
        }
        return Promise.resolve(Promise.all(processorPromises));
    }
};
