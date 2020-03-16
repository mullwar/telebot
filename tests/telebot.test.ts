import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { TeleBot } from "../src";
import { ERROR_TELEBOT_ALREADY_RUNNING, TeleBotError } from "../src/errors";
import { TeleBotFlags, TeleBotOptions, TeleBotScenario } from "../src/types/telebot";
import { TelegramResponse, Update } from "../src/types/telegram";
import { DEFAULT_POLLING } from "../src/telebot";

const MOCK_URL = "/mock";

const mock = new MockAdapter(axios);

mock.onPost(`${MOCK_URL}/getUpdates`).reply(200, {
    ok: true,
    result: [{ update_id: 0 }]
} as TelegramResponse<Update[]>);

type TestCase = {
    name: string;
    options: Partial<TeleBotOptions>;
};

function createNewBot(options: Partial<TeleBotOptions>): TeleBot {
    return new TeleBot({
        token: "__test__",
        botAPI: MOCK_URL,
        ...options
    });
}

([{
    name: "TeleBot using lifeCycle",
    options: {
        polling: {
            interval: false,
            limit: 100
        }
    } as TeleBotOptions
}, {
    name: "TeleBot using lifeInterval",
    options: {
        polling: {
            interval: 100
        },
        allowedUpdates: ["text"]
    } as TeleBotOptions
}] as Array<TestCase>).forEach((testCase) => {
    const { name, options } = testCase;

    describe(name, () => {

        let bot: TeleBot;

        beforeEach(() => {
            bot = createNewBot(options);
        });

        afterEach(() => {
            bot.stop();
        });

        test("validate bot instance options", () => {
            const botOptions = bot.getOptions();
            expect(botOptions).toEqual({
                polling: {
                    ...DEFAULT_POLLING,
                    ...options.polling
                }
            });
        });

        test("flags should set properly", async () => {

            expect(bot.getFlags()).toEqual({
                canFetch: true,
                isRunning: false,
                waitEvents: false
            } as TeleBotFlags);

            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);

            bot.stop();

            expect(bot.hasFlag("isRunning")).toBe(false);
        });

        test("multiple instance resolution scenarios", async () => {

            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);

            // TeleBotScenario.Restart

            bot.runningInstanceScenario = TeleBotScenario.Restart;
            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);

            // TeleBotScenario.Terminate

            try {
                bot.runningInstanceScenario = TeleBotScenario.Terminate;
                bot.start();
            } catch (error) {
                expect(bot.hasFlag("isRunning")).toBe(false);
                expect(error).toEqual(new TeleBotError(ERROR_TELEBOT_ALREADY_RUNNING));
            }

            // TeleBotScenario.Pass

            bot.runningInstanceScenario = TeleBotScenario.Pass;
            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);

            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);
        });

    });
});

