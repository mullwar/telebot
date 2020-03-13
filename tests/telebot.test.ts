import { TeleBot } from "../src/telebot";
import { ERROR_TELEBOT_ALREADY_RUNNING, TeleBotError } from "../src/errors";
import { TeleBotOptions, TeleBotScenario } from "../src/types/telebot";

type TestCase = {
    name: string;
    options: Partial<TeleBotOptions>;
};

function createNewBot(options: Partial<TeleBotOptions>): TeleBot {
    return new TeleBot({
        token: "test",
        polling: {
            interval: 0,
            timeout: 0,
            limit: 100,
            ...options.polling
        }
    });
}

([{
    name: "TeleBot using lifeCycle",
    options: {
        polling: {
            interval: 0
        }
    }
}, {
    name: "TeleBot using lifeInterval",
    options: {
        polling: {
            interval: 100
        }
    }
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

        test("flags should set properly", () => {

            expect(bot.hasFlag("waitEvents")).toBe(options?.polling?.waitEvents === true);
            expect(bot.hasFlag("canFetch")).toBe(true);
            expect(bot.hasFlag("isRunning")).toBe(false);

            bot.start();

            expect(bot.hasFlag("isRunning")).toBe(true);

            bot.stop();

            expect(bot.hasFlag("isRunning")).toBe(false);
        });

        test("multiple instance resolution scenarios", () => {

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

