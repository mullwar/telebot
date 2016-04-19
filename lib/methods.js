'use strict';

// Methods
const methods = {
  getMe: {},
  sendMessage: {
    arguments: ['chat_id', 'text']
  },
  forwardMessage: {
    arguments: ['chat_id', 'from_chat_id', 'message_id']
  },
  sendPhoto: {},
  sendAudio: {},
  sendDocument: {},
  sendSticker: {},
  sendVideo: {},
  sendVoice: {},
  sendLocation: {
    arguments: (chat_id, position) => {
      return {
        chat_id, latitude: position[0], longitude: position[1]
      };
    }
  },
  sendVenue: {},
  sendContact: {},
  sendChatAction: {
    short: 'sendAction',
    arguments: ['chat_id', 'action']
  },
  getUserProfilePhotos: {
    short: 'getUserPhoto',
    arguments: 'chat_id',
    options: (form, opt) => {
      if (opt.offset) form.offset = opt.offset;
      if (opt.limit) form.limit = opt.limit;
      return form;
    }
  },
  getFile: {
    arguments: 'file_id',
    then: file => {
      const result = file.result;
      result.fileLink = this.fileLink + result.file_path;
      return result;
    }
  },
  kickChatMember: {
    short: 'kick',
    arguments: ['chat_id', 'user_id']
  },
  unbanChatMember: {
    short: 'unban',
    arguments: ['chat_id', 'user_id']
  },
  answerInlineQuery: {
    short: 'answerQuery',
    arguments: answers => {
      return {
        inline_query_id: answers.id,
        results: answers.results(),
        next_offset: answers.nextOffset,
        is_personal: answers.personal,
        cache_time: answers.cacheTime
      };
    }
  },
  editMessageText: {
    short: 'editMessage',
    arguments: (obj, text) => editObject(obj, { text })
  },
  editMessageCaption: {
    short: 'editCaption',
    arguments: (obj, caption) => editObject(obj, { caption })
  },
  editMessageReplyMarkup: {
    short: 'editMarkup',
    arguments: (obj, reply_markup) => editObject(obj, { reply_markup })
  },
  setWebhook: {
    arguments: ['url', 'certificate']
  }
};

// Functions

function editObject(obj, form) {
  if (obj.chat && obj.message) {
    form.chat_id = obj.chat;
    form.message_id = obj.message;
  } else if (obj.inline) {
    form.inline_message_id = obj.inline;
  }
  return form;
}

// Export methods
module.exports = methods;
