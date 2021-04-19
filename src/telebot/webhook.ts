import fs from "fs";
import http, { IncomingMessage, ServerResponse } from "http";
import https from "https";
import { TeleBot } from "../telebot";
import { WebhookServer } from "../types/telebot";
import { Update } from "../types/telegram";
import { convertToArray, getUrlPathname } from "../utils";
import { LID } from "./logger";
import { normalizeError } from "../errors";

export const ALLOWED_WEBHOOK_PORTS = [80, 88, 443, 8443];

export function craftWebhookPath(url: string, token: string): string {
    return `${getUrlPathname(url)}${token}`;
}

const listener = (bot: TeleBot, path: string) => (request: IncomingMessage, response: ServerResponse) => {
    if (request.url === path && request.method === "POST") {
        const body: string[] = [];
        request.on("data", (chunk) => body.push(chunk));
        request.on("end", () => {
            try {
                const update = convertToArray<Update>(JSON.parse(body.join()));

                bot.logger.debug(LID.Webhook, { meta: { update } });

                bot.processTelegramUpdates(update).catch((e) => {
                    const error = normalizeError(e);
                    bot.logger.error(LID.Webhook, { error });
                    response.writeHead(500);
                    return error;
                }).finally(() => {
                    response.end();
                });
            } catch (error) {
                bot.logger.error(LID.Webhook, { error });
                response.writeHead(415);
                response.end();
            }
        });
    } else {
        response.writeHead(404);
        response.end();
    }
};

export function creteWebhookServer(bot: TeleBot, options: WebhookServer & { url: string }): Promise<void> {
    const { serverHost, serverPort } = options;

    const key = options.serverKey && fs.readFileSync(options.serverKey);
    const cert = options.serverCert && fs.readFileSync(options.serverCert);

    const isSecure = !!(key && cert);
    const path = craftWebhookPath(options.url, bot.getToken());

    const server = isSecure ?
        https.createServer({ key, cert }, listener(bot, path)) :
        http.createServer(listener(bot, path));

    return new Promise((resolve) => {
        server.listen(serverPort, serverHost, () => {
            bot.logger.info(LID.Webhook, { meta: { serverHost, serverPort } });
            resolve();
        });
    });
}
