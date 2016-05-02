![](http://i.imgur.com/C6nTeCS.png)

Easy way to write Telegram bots.

[![Build Status](https://travis-ci.org/kosmodrey/telebot.svg?branch=dev)](https://travis-ci.org/kosmodrey/telebot) [![Dependency Status](https://david-dm.org/kosmodrey/telebot.svg)](https://david-dm.org/kosmodrey/telebot) ![Node.js Version](http://img.shields.io/node/v/telebot.svg)

**Library features:**

- Simple. Easy to use.
- Support modules.
- No callbacks, Promises only.
- Build-in event system (you can create custom events).
- Extendable and hackable (simple code inside).

## Installation

Download and install via [npm package manager](https://www.npmjs.com/package/telebot) (stable):

```
npm install telebot
```

Or clone fresh code directly from git:

```
git clone https://github.com/kosmodrey/telebot.git
cd telebot
npm install
```

## Usage

Import `telebot` module and create a new bot object:

```js
const TeleBot = require('telebot');

const bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-', // Required.
  sleep: 1000, // Optional. How often check updates (in ms).
  timeout: 0, // Optional. Update pulling timeout (0 - short polling).
  limit: 100, // Optional. Limits the number of updates to be retrieved.
  retryTimeout: 5000 // Optional. Reconnecting timeout (in ms).
  modules: {
    // Optional. Module configuration.
  }
});
```

Or just:

```js
const TeleBot = require('telebot');
const bot = new TeleBot('-PASTEYOURTELEGRAMBOTAPITOKENHERE-');
```

*Replace `token` value to your [Telegram Bot API](https://core.telegram.org/bots#create-a-new-bot) token key.*

To start getting updates, use ```bot.connect()```.

```js
bot.on('text', msg => {
  let fromId = msg.from.id;
  let firstName = msg.from.first_name;
  let reply = msg.message_id;
  return bot.sendMessage(fromId, `Welcome, ${ firstName }!`, { reply });
});

bot.connect();
```

This code will send a "welcome" to every users `text` type message as a reply.

***[See more examples!](/examples)***

## Events

Use ```bot.on(<event>, <function>)``` to handle all possible TeleBot events.

To catch a command with arguments, just add a slash:

```js
bot.on('/hello', msg => {
  let [cmdName, firstName, lastName] = msg.text.split(' ');
  return bot.sendMessage(msg.from.id, `Hello, ${ firstName } ${ lastName }!`);
});
```

Also, you can catch multiple events:

```js
bot.on(['/start', '/help', 'sticker'], msg => {
  return bot.sendMessage(msg.from.id, 'Bam!');
});
```

### TeleBot events:

- **/&#42;** – any user command
- **/\<cmd\>** – on specific command
- **inlineQuery** - on inline query
- **inlineChoice** - on inline choice result
- **callbackQuery** - on button callback
- **connect** – bot connected
- **disconnect** – bot disconnected
- **reconnecting** – bot reconnecting
- **reconnected** – bot successfully reconnected
- **update** - on update
- **tick** – on bot tick
- **error** – an error occurred

#### Action events:

*getMe, sendMessage, forwardMessage, sendPhoto, sendAudio, sendDocument, sendSticker, sendVideo, sendVoice, sendLocation, sendVenue, sendContact, sendAction (sendChatAction), getUserPhoto (getUserProfilePhotos), getFile, kickChatMember, unban (unbanChatMember), answerQuery (answerInlineQuery), editMessage (editMessageText), editCaption (editMessageCaption), editMarkup (editMessageReplyMarkup), setWebhook*

### Telegram message events:

- **&#42;** - any type of message
- **text** – text message
- **audio** – audio file
- **voice** – voice message
- **document** – document file (any kind)
- **photo** – photo
- **sticker** – sticker
- **video** – video file
- **contact** – contact data
- **location** – location data
- **venue** – venue data

*Read more about Telegram Bot API response types: https://core.telegram.org/bots/api#available-types*

## Modifiers

You can add modifier to process data before passing it to event.

```js
bot.mod('text', data => {
  let msg = data.msg;
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
- **\<type\>** - specific type of message (*text, voice, document, photo, sticker, video, contact, location* or *venue*)

## Modules

Use ```bot.use(require(<module_path>))``` to add a module.

**[Check out module folder!](/modules)**

## Documentation

Read [wiki on GitHub](https://github.com/kosmodrey/telebot/wiki).
