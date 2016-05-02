# TeleBot

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

## Documentation

Read [wiki on GitHub](https://github.com/kosmodrey/telebot/wiki).
