import { TeleBotEventName, TeleBotEventProcessor } from "../src/types/telebot";
import { Message, Update } from "../src/types/telegram";
import { TeleBot } from "../src";
import { MOCK_URL } from "./mock/server";

type TestEvent = {
    on: TeleBotEventName;
    update?: Update | Update[];
    processor: TeleBotEventProcessor<any>;
};

function newUpdate(data: Record<string, any>) {
    return {
        update_id: 0,
        message: {
            message_id: 0,
            date: new Date().getTime(),
            chat: {
                id: 0,
                type: "private" as const
            },
            ...data
        }
    };
}

const EVENTS: TestEvent[] = [
    {
        on: "message",
        update: newUpdate({
            text: "any message event"
        }),
        processor(msg: Message) {
            expect(msg.text).toBe("any message event");
        }
    },
    {
        on: "text",
        update: newUpdate({
            text: "text event"
        }),
        processor(msg: Message) {
            expect(msg.text).toBe("text event");
        }
    }
];

describe("TeleBot events", () => {

    const bot = new TeleBot({
        token: "__test__",
        botAPI: () => MOCK_URL,
        log: false
    });

    EVENTS.forEach((event) => bot.on(event.on, event.processor));

    for (const event of EVENTS) {
        test(`on("${event.on}") event`, async () => {
            await bot.processTelegramUpdates(EVENTS.reduce((list: Update[], event) => {
                if (!event.update) return list;
                if (Array.isArray(event.update)) {
                    list = list.concat(event.update);
                } else {
                    list.push(event.update);
                }
                return list;
            }, []));
        });
    }

});
