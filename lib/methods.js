'use strict';

const
  fs = require('fs'),
  nurl = require('url'),
  path = require('path'),
  stream = require('stream'),
  request = require('request');

const ANSWER_METHODS = {
  addArticle: 'article', addPhoto: 'photo', addVideo: 'video',
  addGif: 'gif', addVideoGif: 'mpeg4_gif', addSticker: 'sticker',
  addVoice: 'voice', addDocument: 'document', addLocation: 'location',
  addVenue: 'venue',
  // Cached methods
  cachedPhoto: 'photo', cachedGif: 'gif', cachedVideoGif: 'mpeg4_gif',
  cachedSticker: 'sticker', cachedDocument: 'document', cachedVideo: 'video',
  cachedVoice: 'voice', cachedAudio: 'audio'
};

const DEFAULT_FILE_EXTS = {
  photo: 'jpg', audio: 'mp3', 'document': 'doc',
  sticker: 'webp', voice: 'm4a', 'video': 'mp4'
};

const reURL = /^https?\:\/\/|www\./;

// Methods
const methods = {

  keyboard(keyboard, opt={}) {
    const markup = { keyboard };
    if (opt.resize === true) markup['resize_keyboard'] = true;
    if (opt.once === true) markup['one_time_keyboard'] = true;
    if (opt.selective) markup['selective'] = opt.selective;
    return JSON.stringify(markup);
  },
  
  button(type, text) {
    if (!text && type) return { text: type };
    type = `request_${type}`;
    return { text, [type]: true };
  },
  
  inlineKeyboard(inline_keyboard) {
    return JSON.stringify({ inline_keyboard });
  },

  inlineQueryKeyboard(inline_keyboard) {
    return {inline_keyboard: inline_keyboard};
  },
  
  inlineButton(text, opt={}) {
    const markup = { text };
    if (opt.url) markup.url = opt.url;
    if (opt.inline || opt.inline === '') markup.switch_inline_query = opt.inline;
    if (opt.callback) markup.callback_data = String(opt.callback);
    return markup;
  },
  
  answerList(id, opt) {
    return new AnswerList(id, opt);
  },
  
  getMe: {
    then: data => data.result
  },
  
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
  
  sendContact: {
    arguments: ['chat_id', 'phone_number', 'first_name', 'last_name']
  },
  
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

  getChat: {
    arguments: ['chat_id']
  },

  leaveChat: {
    arguments: ['chat_id']
  },

  getChatAdministrators: {
    short: 'getAdmins',
    arguments: ['chat_id']
  },

  getChatMember: {
    short: 'getMember',
    arguments: ['chat_id', 'user_id']
  },

  getChatMembersCount: {
    short: 'countMembers',
    arguments: ['chat_id']
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

  answerCallbackQuery: {
    short: 'answerCallback',
    arguments: ['callback_query_id', 'text', 'show_alert']
  },
  
  editMessageText: {
    short: 'editText',
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
  
  setWebhook(url, certificate) {
    if (certificate) {
      const form = {
        url,
        certificate: {
          value: fs.readFileSync(certificate),
          options: { filename: 'cert.pem' }
        }
      };
      return this.request('/setWebhook', null, form);
    }
    return this.request('/setWebhook', { url });
  },

  getWebhookInfo: {
    then: data => data.result
  }

};

// Functions

function editObject(obj, form) {
  if (obj.chatId && obj.messageId) {
    form.chat_id = obj.chatId;
    form.message_id = obj.messageId;
  } else if (obj.inlineMsgId) {
    form.inline_message_id = obj.inlineMsgId;
  }
  return form;
}

function sendFile(type, chat_id, file, opt={}) {

  const form = this.properties({ chat_id }, opt);
  const defName = `file.${ DEFAULT_FILE_EXTS[type] }`;

  const url = 'send' + type.charAt(0).toUpperCase() + type.slice(1);

  // Send bot action event
  this.event(url, [].slice.call(arguments).splice(0, 1));

  // Set file caption
  if (opt.caption) form.caption = opt.caption;

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
    if (!opt.fileName) opt.fileName = defName;
    form[type] = {
      value: file,
      options: { filename: opt.fileName }
    };
  } else if (reURL.test(file)) {
    // File url
    if (!opt.fileName)
      opt.fileName = path.basename(nurl.parse(file).pathname) || defName;
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

  return this.request(`/${ url }`, null, form);

}

/* Answer List */

class AnswerList {

  constructor(id, opt={}) {
    this.id = id;
    this.cacheTime = Number(opt.cacheTime) || 300;
    this.nextOffset = opt.nextOffset === undefined ? null : opt.nextOffset;
    this.personal = opt.personal === undefined ? false : opt.personal;
    this.list = [];
  }

  add(type, set={}) {
    set.type = type;
    this.list.push(set);
    return set;
  }

  results() {
    return JSON.stringify(this.list);
  }

}

// Add answer methods
{
  for (let prop in ANSWER_METHODS) {
    AnswerList.prototype[prop] = (name => {
      return function(set) {
        return this.add(name, set);
      };
    })(ANSWER_METHODS[prop]);
  }
}

// Export methods
module.exports = methods;
