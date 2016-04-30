'use strict';

// Command regexp
const reCMD = /^\/([а-я\w\d]+)/;

// Message types
const MESSAGE_TYPES = [
  'text', 'audio', 'voice', 'document', 'photo',
  'sticker', 'video', 'contact', 'location', 'venue'
];

// Update type functions
module.exports = {

  // Message
  message(update, props) {

    // Set promise
    let promise = Promise.resolve();

    // Run global message mod
    let mod = this.modRun('message', { msg: update, props });

    update = mod.msg;
    props = mod.props;

    for (let type of MESSAGE_TYPES) {

      // Check for Telegram API documented types
      if (!(type in update)) continue;

      // Set message type
      props.type = type;

      // Run message type mod
      mod = this.modRun(type, { msg: update, props });

      update = mod.msg;
      props = mod.props;

      // Send type event
      promise = this.event(['*', type], update, props);

      // Check for command
      if (type == 'text') {

        const match = reCMD.exec(update.text);
        if (!match) continue;

        // Set type
        props.type = 'command';

        // Command found
        props.cmd = update.text.split(' ');
        promise = promise.then(x => {
          return this.event(['/*', '/' + match[1]], update, props);
        });

      }

      return promise;

    }
  },

  // Inline query
  inline_query(update, props) {
    props.type = 'inlineQuery';
    return this.event('inlineQuery', update, props);
  },

  // Inline choice
  chosen_inline_result(update, props) {
    props.type = 'inlineChoice';
    return this.event('inlineChoice', update, props);
  },

  // Callback query
  callback_query(update, props) {
    props.type = 'callbackQuery';
    return this.event('callbackQuery', update, props);
  }

};
