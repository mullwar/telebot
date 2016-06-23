'use strict';

// Command regexp
const reCMD = /^\/([0-9а-я\w\d\_\-]+)/;

// Message types
const MESSAGE_TYPES = [
  'edit_date',
  'text', 'audio', 'voice', 'document', 'photo',
  'sticker', 'video', 'contact', 'location', 'venue',
  'new_chat_member', 'left_chat_member', 'new_chat_title',
  'new_chat_photo', 'delete_chat_photo', 'group_chat_created',
  'supergroup_chat_created', 'channel_chat_created', 'migrate_to_chat_id',
  'migrate_from_chat_id', 'pinned_message'
];

const SHORTCUTS = {
  edit_date: 'edited',
  new_chat_member: 'userJoined',
  left_chat_member: 'userLeft',
  new_chat_title: 'newTitle',
  new_chat_photo: 'newPhoto',
  delete_chat_photo: 'deletePhoto',
  pinned_message: 'pinnedMessage',
  group_chat_created: 'groupCreated',
  channel_chat_created: 'channelCreated',
  supergroup_chat_created: 'supergroupCreated',
  migrate_to_chat_id: 'migrateTo',
  migrate_from_chat_id: 'migrateFrom'
};

// Update type functions
const updateFunctions = {

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

      // Shortcut
      if (SHORTCUTS[type]) type = SHORTCUTS[type];
      
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

        // Command found
        props.type = 'command';
        promise = promise.then(x => {
          return this.event(['/*', '/' + match[1]], update, props);
        });

      }

      return promise;

    }
  },

  // Edited message
  edited_message(update, props) {
    return updateFunctions.message.call(this, update, props);
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

module.exports = updateFunctions;
