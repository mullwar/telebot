# TeleBot

Easy way to write Telegram bots.

[![Dependency Status](https://david-dm.org/kosmodrey/telebot.svg)](https://david-dm.org/kosmodrey/telebot)

## Installation

Download and install via [npm](https://www.npmjs.com/package/telebot) package manager:

```
npm install telebot
```

Or clone directly from git:

```
git clone https://github.com/kosmodrey/telebot.git
cd telebot
npm install
```

## Usage

Import `telebot` module and create a new bot object:

```js
var TeleBot = require('telebot');

var bot = new TeleBot({
  token: '-PASTEYOURTELEGRAMBOTAPITOKENHERE-',
  sleep: 1000, // How often check updates (in ms)
  timeout: 0, // Update pulling timeout (0 - short polling)
  limit: 100, // Limits the number of updates to be retrieved
});
```

*Replace `token` value to your [Telegram Bot API](https://core.telegram.org/bots#botfather) token key.*

To start getting updates, use ```bot.connect()``` and ```bot.disconnect()``` to stop.

```js
bot.on('text', function(msg) {
  var id = msg.from.id;
  var mId = msg.message_id;
  var firstName = msg.from.first_name;
  return bot.sendMessage(id, 'Welcome, ' + firstName + '!', { reply: mId });
});

bot.connect();
```

This code will send a "welcome" to every users `text` type message as reply.

***[See more code examples!](/examples)***

## Events

Use ```bot.on(<event>, <function>)``` to handle all possible events.

To catch a command with arguments, just add a slash:

```js
bot.on('/hello', function(msg) {
  var first = this.cmd[1] || 'Anonymous';
  var last = this.cmd[2] || '';
  return bot.sendMessage(msg.from.id, 'Hello, ' + first + ' ' + last + '!');
});
```

Also, you can catch multiple events:

```js
bot.on(['/start', '/help'], function(msg) {
  return bot.sendMessage(msg.from.id, 'Bam!');
});
```

### TeleBot events:

- **/&#42;** – any command
- **/\<cmd\>** – on command
- **connect** – bot connected
- **disconnect** – bot disconnected
- **update** - on update
- **tick** – on bot tick
- **error** – an error occurred

#### Action events:

*getMe, forwardMessage, getUserPhoto, sendAction, sendMessage, sendLocation, sendPhoto, sendAudio, sendDocument, sendSticker, sendVideo, setWebhook*

### Telegram message events:

- **&#42;** - any type of message
- **text** – text message
- **audio** – audio file
- **document** – document file (any kind)
- **photo** – photo file
- **sticker** – sticker message
- **video** – video file
- **contact** – contact data
- **location** – location data

*Read more about Telegram Bot API response types: https://core.telegram.org/bots/api#available-types*

## Modifiers

You can add modifier to process data, before passing to event handler.

```
bot.mod('message', function(data) {
  var msg = data.msg;
  if (msg.text) {
    msg.text = '📢 ' + msg.text;
  }
  return data;
});
```

This code adds emoji to every text message.

### Standart names:

- **message** - process every message
- **update** - process update data (bunch of messages)

## Modules

Use ```bot.use(require(<module_path>))``` to add a module.

**[Check out modules folder!](/modules)**

## Methods

### Bot functions:

##### `on(<event>, <function>)`

Handles events.

##### `event(<event>, <data>)`

Invokes the event handlers.

##### `mod(<name>, <fn>)`

Add data modifier.

##### `runMod(<name>, <data>)`

Run data modifiers.

##### `keyboard([<arrays>], <options:{resize, once, selective}>)`

Creates `ReplyKeyboardMarkup` keyboard `markup` object

##### `connect()`

Start pulling updates.

##### `disconnect()`

Stop pulling updates.

### Bot Actions:

TeleBot use standard [Telegram Bot API](https://core.telegram.org/bots/api#available-methods) method names.

##### `getMe()`

A simple method for testing your bot's auth token.

##### `sendMessage(<id>, <text>, <options:{reply, markup}>)`

Use this method to send text messages.

##### `forwardMessage(<id>, <fromId>, <messageId>)`

Use this method to forward messages of any kind.

##### `sendPhoto(<id>, <photo:[id|url|stream]>, <options:{name, reply, markup}>)`

Use this method to send photos.

##### `sendAudio(<id>, <audio:[id|url|stream]>, <options:{name, reply, markup}>)`

Use this method to send audio files, if you want Telegram clients to display the file as a playable voice message.

##### `sendDocument(<id>, <document:[id|url|stream]>, <options:{name, reply, markup}>)`

Use this method to send general files.

##### `sendSticker(<id>, <sticker:[id|url|stream]>, <options:{name, reply, markup}>)`

Use this method to send `.webp` stickers.

##### `sendVideo(<id>, <video:[id|url|stream]>, <options:{name, reply, markup}>)`

Use this method to send video files, Telegram clients support `mp4` videos (other formats may be sent as `Document`). 

##### `sendLocation(<id>, [<latitude>, <longitude>], <options:{reply, markup}>)`

Use this method to send point on the map.

##### `sendAction(<id>, <action>)`

Use this method when you need to tell the user that something is happening on the bot's side.

##### `getUserPhoto(<id>, <options:{offset, limit}>)`

Use this method to get a list of profile pictures for a user.

##### `setWebhook(<url>)`

Use this method to specify a url and receive incoming updates via an outgoing webhook.
