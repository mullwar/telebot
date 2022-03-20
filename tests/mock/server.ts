import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { TelegramResponse, Update, User, WebhookInfo, WebhookResponse } from "../../src/types/telegram";

export const MOCK_URL = "/mock";
export const MOCK_WEBHOOK = "https://webhook.mock";

const mock = new MockAdapter(axios);

mock.onPost(`${MOCK_URL}/deleteWebhook`).reply(200, {
  ok: true,
  result: {
    url: MOCK_WEBHOOK,
    has_custom_certificate: false,
    pending_update_count: 0
  }
} as TelegramResponse<WebhookInfo>);

mock.onPost(`${MOCK_URL}/setWebhook`).reply(200, {
  ok: true,
  result: true
} as TelegramResponse<WebhookResponse>);

mock.onPost(`${MOCK_URL}/getUpdates`).reply(200, {
  ok: true,
  result: [{ update_id: 0 }]
} as TelegramResponse<Update[]>);

mock.onPost(`${MOCK_URL}/getMe`).reply(200, {
  ok: true,
  result: {
    id: 0,
    is_bot: true,
    first_name: "MockBot"
  }
} as TelegramResponse<User>);
