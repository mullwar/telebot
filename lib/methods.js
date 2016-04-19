'use strict';

const
  fs = require('fs'),
  nurl = require('url'),
  path = require('path'),
  stream = require('stream'),
  request = require('request');

const REGEX = {
  url: /^https?\:\/\/|www\./
};

// Methods
const methods = {
  getMe: {},
  sendMessage: {
    arguments: ['chat_id', 'text']
  },
  forwardMessage: {
    arguments: ['chat_id', 'from_chat_id', 'message_id']
  },
  sendPhoto(id, photo, opt) {
    return sendFile.call(this, 'photo', id, photo, opt);
  },
  sendAudio(id, audio, opt) {
    return sendFile.call(this, 'audio', id, audio, opt);
  },
  sendDocument(id, doc, opt) {
    return sendFile.call(this, 'document', id, doc, opt);
  },
  sendSticker(id, sticker, opt) {
    return sendFile.call(this, 'sticker', id, sticker, opt);
  },
  sendVideo(id, video, opt) {
    return sendFile.call(this, 'video', id, video, opt);
  },
  sendVoice(id, voice, opt) {
    return sendFile.call(this, 'voice', id, voice, opt);
  },
  sendLocation: {
    arguments: (chat_id, position) => {
      return {
        chat_id, latitude: position[0], longitude: position[1]
      };
    }
  },
  sendVenue: {
    arguments: (chat_id, position, title, address) => {
      return {
        chat_id, latitude: position[0], longitude: position[1], title, address
      }
    },
    options: (form, opt) => {
      if (opt.foursquare) form.foursquare_id = opt.foursquare;
      return form;
    }
  },
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

function sendFile(type, chat_id, file, opt) {
  opt = opt || {};
  const form = this.properties({ chat_id }, opt);
  let url = 'send' + type.charAt(0).toUpperCase() + type.slice(1);
  // Send bot action event
  this.event(url, [].slice.call(arguments).splice(0, 1));
  // Set file caption
  if (opt.caption) form.caption = opt.caption;
  url = '/' + url;
  if (file instanceof stream.Stream) {
    // File stream object
    if (!opt.fileName)
      opt.fileName = nurl.parse(path.basename(file.path)).pathname;
    form[type] = {
      value: file,
      options: { filename: opt.fileName }
    };
  } else if (Buffer.isBuffer(file)) {
    // File buffer
    if (!opt.fileName) opt.fileName = 'blob_file';
    form[type] = {
      value: file,
      options: { filename: opt.fileName }
    };
  } else if (REGEX.url.test(file)) {
    // File url
    if (!opt.fileName)
      opt.fileName = path.basename(nurl.parse(file).pathname) || 'file';
    form[type] = {
      value: request.get(file),
      options: { filename: opt.fileName }
    };  
  } else if (fs.existsSync(file)) {
    // File location
    if (!opt.fileName) opt.fileName = path.basename(file);
    form[type] = {
      value: fs.createReadStream(file),
      options: { filename: opt.fileName }
    };
  } else {
    // File as 'file_id'
    form[type] = file;
  }
  return this.request(url, null, form);
}

// Export methods
module.exports = methods;
