![](http://i.imgur.com/eELz6Aw.jpg)

The easy way to write Telegram bots.

[![Build Status](https://travis-ci.org/mullwar/telebot.svg)](https://travis-ci.org/mullwar/telebot) [![Dependency Status](https://david-dm.org/mullwar/telebot.svg)](https://david-dm.org/mullwar/telebot) ![Node.js Version](http://img.shields.io/node/v/telebot.svg)

[![TeleBot 2.0](https://img.shields.io/badge/dev-TeleBot%202%2e0-ff0061.svg)](https://github.com/mullwar/telebot/tree/version-2) [![TeleBot Examples](https://img.shields.io/badge/telebot-examples-blue.svg)](https://github.com/mullwar/telebot/tree/master/examples) [![TeleBot Bot](https://img.shields.io/badge/telebot-community%20bot-blue.svg)](https://github.com/mullwar/telebot-bot) [![TeleBot Group](https://img.shields.io/badge/telebot-community%20group-blue.svg)](https://goo.gl/gXvm12)


**Library features:**

- 🍎 Simple. Easy to use.
- 🏰 Full [Telegram Bot API](https://core.telegram.org/bots/API) support.
- 💰 Supports [payments](https://core.telegram.org/bots/payments).
- 🔌 Supports [plugins](https://github.com/mullwar/telebot-plugins)!
- 📡 Build-in modification and event system.
- 🛠 Extendable and hackable.
- 🔮 No callbacks, Promises only.
- 🤓 Readable [changelog](https://github.com/mullwar/telebot/releases).
- ☺️ Friendly [TeleBot community group](https://goo.gl/gXvm12).

## 🔨 Installation

```
npm install telebot
```

Or using [yarn](https://yarnpkg.com) package manager:

```
yarn add telebot
```

## 🕹 Usage

Import `telebot` module and create a new bot object:

```js
const TeleBot = require('telebot');

const bot = new TeleBot({
    token: TELEGRAM_BOT_TOKEN, // Required. Telegram Bot API token.
    polling: { // Optional. Use polling.
        interval: 1000, // Optional. How often check updates (in ms).
        timeout: 0, // Optional. Update polling timeout (0 - short polling).
        limit: 100, // Optional. Limits the number of updates to be retrieved.
        retryTimeout: 5000, // Optional. Reconnecting timeout (in ms).
        proxy: 'http://username:password@yourproxy.com:8080' // Optional. An HTTP proxy to be used.
    },
    webhook: { // Optional. Use webhook instead of polling.
        key: 'key.pem', // Optional. Private key for server.
        cert: 'cert.pem', // Optional. Public key.
        url: 'https://....', // HTTPS url to send updates to.
        host: '0.0.0.0', // Webhook server host.
        port: 443, // Server port.
        maxConnections: 40 // Optional. Maximum allowed number of simultaneous HTTPS connections to the webhook for update delivery
    },
    allowedUpdates: [], // Optional. List the types of updates you want your bot to receive. Specify an empty list to receive all updates.
    usePlugins: ['askUser'], // Optional. Use user plugins from pluginFolder.
    pluginFolder: '../plugins/', // Optional. Plugin folder location.
    pluginConfig: { // Optional. Plugin configuration.
        // myPluginName: {
        //   data: 'my custom value'
        // }
    }
});
```

Or just:

```js
const TeleBot = require('telebot');
const bot = new TeleBot(TELEGRAM_BOT_TOKEN);
```

*Don't forget to insert your [Telegram Bot API](https://core.telegram.org/bots#create-a-new-bot) token key.*

To start polling updates, use `bot.start()`.

```js
bot.on('text', (msg) => msg.reply.text(msg.text));

bot.start();
```

We just created echo bot!

## 🌱 Quick examples

Send text on `/start` or `/hello` command:

```js
bot.on(['/start', '/hello'], (msg) => msg.reply.text('Welcome!'));
```

When sticker received, reply back:

```js
bot.on('sticker', (msg) => {
    return msg.reply.sticker('http://i.imgur.com/VRYdhuD.png', { asReply: true });
});
```

Sends photo on "show kitty" or "kitty" text message (using RegExp):

```js
bot.on(/(show\s)?kitty*/, (msg) => {
    return msg.reply.photo('http://thecatapi.com/api/images/get');
});
```

Command with arguments `/say <your message>`:

```js
bot.on(/^\/say (.+)$/, (msg, props) => {
    const text = props.match[1];
    return bot.sendMessage(msg.from.id, text, { replyToMessage: msg.message_id });
});
```

When message was edited:

```js
bot.on('edit', (msg) => {
    return msg.reply.text('I saw it! You edited message!', { asReply: true });
});
```

*Note: `msg.reply` is a bot method shortcut, part of [shortReply](/plugins/shortReply.js) build-in plugin.*

***[See more examples!](/examples)***

## ⏰ Events

Use `bot.on(<event>, <function>)` to handle all possible TeleBot events.

For example, to catch a command, just add a slash:

```js
bot.on('/hello', (msg) => {
  return bot.sendMessage(msg.from.id, `Hello, ${ msg.from.first_name }!`);
});
```

Also, you can catch multiple events:

```js
bot.on(['/start', 'audio', 'sticker'], msg => {
  return bot.sendMessage(msg.from.id, 'Bam!');
});
```

### TeleBot events:

- **/&#42;** – any user command
- **/\<cmd\>** – on specific command
- **start** – bot started
- **stop** – bot stopped
- **reconnecting** – bot reconnecting
- **reconnected** – bot successfully reconnected
- **update** - on update
- **tick** – on bot tick
- **error** – an error occurred
- **inlineQuery** - inline query data
- **chosenInlineResult** - inline query chosen result
- **callbackQuery** - button callback data
- **shippingQuery** - incoming shipping query
- **preShippingQuery** - incoming pre-checkout query

#### Events:

*keyboard*, *button*, *inlineKeyboard*, *inlineQueryKeyboard*, *inlineButton*, *answerList*, *getMe*, *sendMessage*, *deleteMessage*, *forwardMessage*, *sendPhoto*, *sendAudio*, *sendDocument*, *sendSticker*, *sendVideo*, *sendVideoNote*, *sendVoice*, *sendLocation*, *sendVenue*, *sendContact*, *sendChatAction*, *getUserProfilePhotos*, *getFile*, *kickChatMember*, *unbanChatMember*, *answerInlineQuery*, *answerCallbackQuery*, *answerShippingQuery*, *answerPreCheckoutQuery*, *editMessageText*, *editMessageMedia*, *editMessageCaption*, *editMessageReplyMarkup*, *setWebhook*

### Telegram message events:

- **&#42;** - any type of message
- **text** – text message
- **audio** – audio file
- **voice** – voice message
- **document** – document file (any kind)
- **photo** – photo
- **sticker** – sticker
- **video** – video file
- **videoNote** - video note
- **animation** – animation data
- **contact** – contact data
- **location** – location data
- **venue** – venue data
- **game** - game data
- **invoice** - invoice for a payment
- **edit** – edited message
- **forward** – forwarded message
- **pinnedMessage** – message was pinned
- **newChatMembers** - new members that were added to the group or supergroup
- **leftChatMember** – member was removed
- **newChatTitle** – new chat title
- **newChatPhoto** – new chat photo
- **deleteChatPhoto** – chat photo was deleted
- **groupChatCreated** – group has been created
- **channelChatCreated** – channel has been created
- **supergroupChatCreated** – supergroup has been created
- **migrateToChat** – group has been migrated to a supergroup
- **migrateFromChat** – supergroup has been migrated from a group
- **successfulPayment** – message is a service message about a successful payment
- **passportData** – Telegram Passport data

*Read more about Telegram Bot API response types: https://core.telegram.org/bots/api#available-types*

## 🚜 Modifiers

You can add modifier to process data before passing it to event.

```js
bot.mod('text', (data) => {
  let msg = data.message;
  msg.text = `📢 ${ msg.text }`;
  return data;
});
```

This code adds emoji to every `text` message.

### TeleBot modifiers:

- **property** - mod form properties
- **updateList** - list of updates in one tick
- **update** - every update
- **message** - process any type of message
- **\<type\>** - specific type of message

## 🔌 Plugins

Use `usePlugins` config option to load plugins from `pluginFolder` directory:

```js
const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    usePlugins: ['askUser', 'commandButtons'],
    pluginFolder: '../plugins/',
    pluginConfig: {
        // Plugin configs
    }
});
```

Or use `plug(require(<plugin_path>))` to plug an external plugin.

***[Check out build-in plugin folder!](/plugins)***

### Plugin structure

```js
module.exports = {
    id: 'myPlugin', // Unique plugin name
    defaultConfig: {
        // Default plugin config
        key: 'value'
    },
    plugin(bot, pluginConfig) {
        // Plugin code
    }
};
```

## ⚙️ Methods

### TeleBot methods:

##### `on(<events>, <function>)`

Handles events.

##### `event(<event>, <data>)`

Invokes the event handlers.

##### `mod(<name>, <fn>)`

Add data modifier.

##### `modRun(<names>, <data>)`

Run data modifiers.

##### `plug(<plugin function>)`

Use plugin function.

##### `keyboard([array of arrays], {resize, once, remove, selective})`

Creates `ReplyKeyboardMarkup` keyboard `replyMarkup` object.

##### `button(<location | contact>, <text>)`

Creates `KeyboardButton` button.

##### `inlineButton(<text>, {url | callback | game | inline | inlineCurrent | pay})`

Creates `InlineKeyboardButton` button object.

##### `inlineKeyboard([array of arrays])`

Creates inlineKeyboard object for normal bot messages.

##### `answerList(<inline_query_id>, {nextOffset, cacheTime, personal, pmText, pmParameter})`

Creates `answerInlineQuery` answer list object.

##### `inlineQueryKeyboard([array of arrays])`

Creates inlineKeyboard object for answerList articles.

##### `start()`

Start polling updates.

##### `stop(<message>)`

Stop polling updates.

### Telegram methods:

TeleBot use standard [Telegram Bot API](https://core.telegram.org/bots/api#available-methods) method names.

##### `getMe()`

A simple method for testing your bot's auth token.

##### `answerQuery(<answerList>)`

Use this method to send `answerList` to an inline query.

##### `getFile(<file_id>)`

Use this method to get basic info about a file and prepare it for downloading.

##### `sendMessage(<chat_id>, <text>, {parseMode, replyToMessage, replyMarkup, notification, webPreview})`

Use this method to send text messages.

##### `forwardMessage(<chat_id>, <from_chat_id>, <message_id>, {notification})`

Use this method to forward messages of any kind.

##### `deleteMessage(<chat_id>, <from_message_id>)`

Use this method to delete a message. A message can only be deleted if it was sent less than 48 hours ago. Any such sent outgoing message may be deleted. Additionally, if the bot is an administrator in a group chat, it can delete any message. If the bot is an administrator of a supergroup or channel, it can delete ordinary messages from any other user, including service messages about people added or removed from the chat. Returns *True* on success.

##### `sendPhoto(<chat_id>, <file_id | path | url | buffer | stream>, {caption, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send photos.

##### `sendAudio(<chat_id>, <file_id | path | url | buffer | stream>, {title, performer, duration, caption, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message.

##### `sendDocument(<chat_id>, <file_id | path | url | buffer | stream>, {caption, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send general files.

##### `sendAnimation(<chat_id>, <animation>, {caption, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send animation files (GIF or H.264/MPEG-4 AVC video without sound).

##### `sendSticker(<chat_id>, <file_id | path | url | buffer | stream>, {fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send `.webp` stickers.

##### `sendVideo(<chat_id>, <file_id | path | url | buffer | stream>, {duration, width, height, caption, fileName, serverDownload, replyToMessage, replyMarkup, notification, supportsStreaming})`

Use this method to send video files, Telegram clients support `mp4` videos (other formats may be sent as `Document`).

##### `sendVideoNote(<chat_id>, <file_id | path | url | buffer | stream>, {duration, length, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send video messages.

##### `sendMediaGroup(<chat_id>, <mediaList: InputMedia[]>)`

Use this method to send a group of photos or videos as an album. (Min. 2)

##### `sendVoice(<chat_id>, <file_id | path | url | buffer | stream>, {duration, caption, fileName, serverDownload, replyToMessage, replyMarkup, notification})`

Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message.

##### `sendLocation(<chat_id>, [<latitude>, <longitude>], {replyToMessage, replyMarkup, notification})`

Use this method to send point on the map.

##### `sendLocation(<chat_id>, [<latitude>, <longitude>], {replyToMessage, replyMarkup, notification})`

Use this method to send point on the map.

##### `editMessageLiveLocation({chatId + messageId | inlineMessageId, latitude, longitude}, {replyMarkup})`

Use this method to edit live location messages sent by the bot or via the bot (for inline bots). A location can be edited until its live_period expires or editing is explicitly disabled by a call to stopMessageLiveLocation.

##### `stopMessageLiveLocation({chatId + messageId | inlineMessageId}, {replyMarkup})`

Use this method to stop updating a live location message sent by the bot or via the bot (for inline bots) before live_period expires.

##### `sendVenue(<chat_id>, [<latitude>, <longitude>], <title>, <address>, {foursquareId, foursquareType, replyToMessage, replyMarkup, notification})`

Use this method to send information about a venue.

##### `getStickerSet(<name>)`

Use this method to get a sticker set.

##### `uploadStickerFile(<user_id>, <file_id | path | url | buffer | stream>)`

Use this method to upload a .png file with a sticker for later use in createNewStickerSet and addStickerToSet methods (can be used multiple times).

##### `createNewStickerSet(<user_id>, <name>, <file_id | path | url | buffer | stream>, <emojis>, {containsMasks, maskPosition})`

Use this method to create new sticker set owned by a user. The bot will be able to edit the created sticker set.

##### `setChatStickerSet(<chat_id>, <sticker_set_name>)`

Use this method to set a new group sticker set for a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `deleteChatStickerSet(<chat_id>)`

Use this method to delete a group sticker set from a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `addStickerToSet(<user_id>, <name>, <file_id | path | url | buffer | stream>, <emojis>, {maskPosition})`

Use this method to add a new sticker to a set created by the bot.

##### `setStickerPositionInSet(<sticker>, <position>)`

Use this method to move a sticker in a set created by the bot to a specific position.

##### `deleteStickerFromSet(<sticker>)`

Use this method to delete a sticker from a set created by the bot.

##### `sendContact(<chat_id>, <number>, <firstName>, <lastName>, { replyToMessage, replyMarkup, notification})`

Use this method to send phone contacts.

##### `sendAction(<chat_id>, <action>)`

Use this method when you need to tell the user that something is happening on the bot's side. Choose one, depending on what the user is about to receive: *typing* for text messages, *upload_photo* for photos, *record_video* or *upload_video* for videos, *record_audio* or *upload_audio* for audio files, *upload_document* for general files, *find_location* for location data, *record_video_note* or *upload_video_note* for video notes.

##### `sendGame(<chat_id>, <game_short_name>, {notification, replyToMessage, replyMarkup})`

Use this method to send a game.

##### `setGameScore(<user_id>, <score>, {force, disableEditMessage, chatId, messageId, inlineMessageId})`

Use this method to set the score of the specified user in a game. On success, if the message was sent by the bot, returns the edited *Message*, otherwise returns *True*. Returns an error, if the new score is not greater than the user's current score in the chat and force is *False*.

##### `getGameHighScores(<user_id>, {chatId, messageId, inlineMessageId})`

Use this method to get data for high score tables. Will return the score of the specified user and several of his neighbours in a game. On success, returns an *Array* of *GameHighScore* objects.

##### `getUserProfilePhotos(<user_id>, {offset, limit})`

Use this method to get a list of profile pictures for a user.

##### `getFile(<file_id>)`

Use this method to get basic info about a file and prepare it for downloading.

##### `sendInvoice(<chat_id>, {title, description, payload, providerToken, startParameter, currency, sendPhoneNumberToProvider, sendEmailToProvider, prices, providerData, photo: {url, width, height}, need: {name, phoneNumber, email, shippingAddress}, isFlexible, notification, replyToMessage, replyMarkup})`

Use this method to send invoices.

##### `getChat(<chat_id>)`

Use this method to get up to date information about the chat.

##### `leaveChat(<chat_id>)`

Use this method for your bot to leave a group, supergroup or channel.

##### `getChatAdministrators(<chat_id>)`

Use this method to get a list of administrators in a chat.

##### `getChatMembersCount(<chat_id>)`

Use this method to get the number of members in a chat.

##### `getChatMember(<chat_id>, <user_id>)`

Use this method to get information about a member of a chat.

##### `kickChatMember(<chat_id>, <user_id>, {untilDate})`

Use this method to kick a user from a group or a supergroup.

##### `unbanChatMember(<chat_id>, <user_id>)`

Use this method to unban a previously kicked user in a supergroup.

##### `restrictChatMember(<chat_id>, <user_id>, {untilDate, canSendMessages, canSendMediaMessages, canSendOtherMessages, canAddWebPagePreviews})`

Use this method to restrict a user in a supergroup. The bot must be an administrator in the supergroup for this to work and must have the appropriate admin rights.

##### `promoteChatMember(<chat_id>, <user_id>, {canChangeInfo, canPostMessages, canEditMessages, canDeleteMessages, canInviteUsers, canRestrictMembers, canPinMessages, canPromoteMembers})`

Use this method to promote or demote a user in a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `exportChatInviteLink(<chat_id>)`

Use this method to export an invite link to a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `setChatPhoto(<chat_id>, <file_id | path | url | buffer | stream>)`

Use this method to set a new profile photo for the chat. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `deleteChatPhoto(<chat_id>)`

Use this method to delete a chat photo. Photos can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `setChatTitle(<chat_id>, <title>)`

Use this method to change the title of a chat. Titles can't be changed for private chats. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `setChatDescription(<chat_id>, <description>)`

Use this method to change the description of a supergroup or a channel. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `pinChatMessage(<chat_id>, <message_id>)`

Use this method to pin a message in a supergroup. The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.

##### `editMessageText({chatId & messageId | inlineMsgId}, <text>)`

Use this method to edit text messages sent by the bot or via the bot (for inline bots).

##### `editMessageMedia({chatId | messageId | inlineMessageId, media: InputMedia, replyMarkup: inlineKeyboard})`

Use this method to edit animation, audio, document, photo, or video messages.

##### `editMessageCaption({chatId & messageId | inlineMsgId}, <caption>)`

Use this method to edit captions of messages sent by the bot or via the bot (for inline bots).

##### `editMessageReplyMarkup({chatId & messageId | inlineMsgId}, <replyMarkup>)`

Use this method to edit only the reply markup of messages sent by the bot or via the bot (for inline bots).

##### `answerCallbackQuery(<callback_query_id>, {text, url, showAlert, cacheTime})`

Use this method to send answers to callback queries sent from inline keyboards.

##### `answerShippingQuery(<shipping_query_id>, <ok> {shippingOptions, errorMessage})`

Use this method to reply to shipping queries.

##### `answerPreCheckoutQuery(<pre_checkout_query_id>, <ok> {errorMessage})`

Use this method to respond to such pre-checkout queries.

##### `setWebhook(<url>, <certificate>, <allowed_updates>, <max_connections>)`

Use this method to specify a url and receive incoming updates via an outgoing webhook.

##### `getWebhookInfo()`

Use this method to get current webhook status.

##### `deleteWebhook()`

Use this method to remove webhook integration if you decide to switch back to getUpdates. Returns `True` on success.

##### `sendDice(<chatId>, <emoji>)`

Use this method to send a dynamic emoji. Examples: 🎲 (default), 🎯 or 🏀.
