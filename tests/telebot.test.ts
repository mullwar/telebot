import { TeleBot } from "../src";
import { TeleBotFlags, TeleBotOptions } from "../src/types/telebot";
import { DEFAULT_POLLING } from "../src/telebot";
import { MOCK_URL, MOCK_WEBHOOK } from "./mock/server";

type TestCase = {
    name: string;
    options: Partial<TeleBotOptions>;
};

function createNewBot(options: Partial<TeleBotOptions>): TeleBot {
  return new TeleBot({
    token: "__test__",
    botAPI: () => MOCK_URL,
    log: false,
    ...options
  });
}

([
  {
    name: "TeleBot using lifeCycle",
    options: {
      polling: {
        interval: false,
        limit: 10
      }
    } as TeleBotOptions
  },
  {
    name: "TeleBot using lifeInterval",
    options: {
      polling: {
        interval: 100
      },
      allowedUpdates: ["message"]
    } as TeleBotOptions
  },
  {
    name: "TeleBot using webhook",
    options: {
      webhook: {
        url: MOCK_WEBHOOK
      }
    } as TeleBotOptions
  }
] as Array<TestCase>).forEach((testCase) => {
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
      expect(botOptions).toMatchObject({
        polling: {
          ...DEFAULT_POLLING
        },
        ...options
      });
    });

    test("flags should set properly", async () => {

      expect(bot.getFlags()).toEqual({
        canFetch: true,
        isRunning: false,
        waitEvents: false
      } as TeleBotFlags);

      await bot.start();

      expect(bot.hasFlag("isRunning")).toBe(true);

      bot.stop();

      expect(bot.hasFlag("isRunning")).toBe(false);
    });

  });
});
