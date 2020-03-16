import fs from "fs";
import url from "url";
import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { TeleBot } from "../telebot";
import { WebhookOptions } from "../types/telebot";
import { TeleBotError } from "../errors";
import { Update } from "../types/telegram";

export function webhookServer(bot: TeleBot, options: WebhookOptions) {

    const { host, port } = options;

    const key = options.key && fs.readFileSync(options.key);
    const cert = options.cert && fs.readFileSync(options.cert);

    const pathname = url.parse(options.url).pathname;

    function listener(request: IncomingMessage, response: ServerResponse) {
        const path = pathname && pathname !== "/" ? pathname : "";
        const endpoint = `${path}/${bot.getToken()}`;

        if (request.url === endpoint && request.method === "POST") {
            const body: string[] = [];

            request.on("data", (chunk) => body.push(chunk));
            request.on("end", () => {
                let update: Update;

                try {
                    update = JSON.parse(body.join(""));
                } catch (error) {
                    response.writeHead(415);
                    response.end();
                    throw new TeleBotError(error);
                }

                bot.processTelegramUpdates([update])
                    .catch(() => {
                        response.writeHead(500);
                    })
                    .finally(() => {
                        response.end();
                    });
            });
        }

    }

    const server = key && cert ? https.createServer({ key, cert }, listener) : http.createServer(listener);

    server.listen(port, host, () => {
        bot.dev.log("webhook", `started${key ? " secure" : ""} server on "${host}:${port}"`);
    });

}
