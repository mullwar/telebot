import fs from "fs";
import url from "url";
import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { TeleBot } from "../telebot";
import { WebhookOptions } from "../types/telebot";
import { Update } from "../types/telegram";
import { convertToArray } from "../utils";
import { LID } from "./logger";
import { normalizeError } from "../errors";

export const ALLOWED_WEBHOOK_PORTS = [80, 88, 443, 8443];

export async function webhookServer(bot: TeleBot, options: WebhookOptions): Promise<void> {
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
                let update: Update[];

                try {
                    update = convertToArray<Update>(JSON.parse(body.join()));
                } catch (error) {
                    bot.logger.error(LID.Webhook, { error });
                    response.writeHead(415);
                    response.end();
                    return error;
                }

                bot.logger.debug(LID.Webhook, { meta: { update } });

                bot.processTelegramUpdates(update).catch((e) => {
                    const error = normalizeError(e);
                    bot.logger.error(LID.Webhook, { error });
                    response.writeHead(500);
                    return error;
                }).finally(() => {
                    response.end();
                });
            });
        }

    }

    const server = key && cert ? https.createServer({ key, cert }, listener) : http.createServer(listener);

    server.listen(port, host, () => {
        bot.logger.info(LID.Webhook, { meta: { port, host } });
        // eslint-disable-next-line no-console
        console.log(`TeleBot started${key ? " secure" : ""} webhook server on "${host}:${port}"`);
    });

}
