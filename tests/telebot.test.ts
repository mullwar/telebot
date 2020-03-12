import TeleBot from "../src/telebot";

test("TeleBot", () => {
    const bot = new TeleBot({
        token: "test",
        polling: {
            limit: 100,
            interval: 0,
            timeout: 0,
            waitEvents: true
        }
    });

    expect(bot.hasFlag("waitEvents")).toBe(true);
    expect(bot.hasFlag("canFetch")).toBe(true);
    expect(bot.hasFlag("isRunning")).toBe(false);
});
