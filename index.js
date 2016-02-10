'use strict';

var request = require('request');
var mime = require('mime-db');

/* Globals */

var TYPES = [
  'text', 'audio', 'voice', 'document', 'photo',
  'sticker', 'video', 'contact', 'location', 'query'
];

var RE = {
  cmd: /^\/([а-я\w\d]+)/,
  url: /^https?\:\/\/|www\./,
  name: /[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/
};

/* Telegram Bot */

var TeleBot = function(cfg) {
  var self = this;
  self.cfg = cfg;
  self.token = cfg.token;
  self.id = self.token.split(':')[0];
  self.api = 'https://api.telegram.org/bot' + self.token;
  self.fileLink = 'https://api.telegram.org/file/bot' + self.token + '/';
  self.limit = Number(cfg.limit) || 100;
  self.timeout = cfg.timeout >= 0 ? cfg.timeout : 0;
  self.retryTimeout = cfg.retryTimeout >= 0 ? cfg.retryTimeout : 5000;
  self.retry = false;
  self.pool = true;
  self.loopFn = null;
  self.looping = false;
  self.sleep = Number(cfg.sleep) || 1000;
  self.updateId = 0;
  self.eventList = {};
  self.modList = {};
};

/* Answer List */

var answerList = function(queryId) {
  this.id = queryId;
  this.list = [];
};

answerList.prototype = {
  results: function() {
    return JSON.stringify(this.list);
  },
  add: function(type, set) {
    set = set || {};
    set.type = type;
    this.list.push(set);
    return set;
  }
};

// Add answer methods
(function() {
  var methods = {
    addArticle: 'article', addPhoto: 'photo', addVideo: 'video',
    addGif: 'gif', addVideoGif: 'mpeg4_gif'
  };
  for (var prop in methods) {
    answerList.prototype[prop] = (function(name) {
      return function(set) {
        return this.add(name, set);
      };
    })(methods[prop]);
  }
}());

TeleBot.prototype = {
/* Modules */
  use: function(fn) {
    return fn.call(this, this);
  },
/* Keyboard */
  keyboard: function(keys, opt) {
    opt = opt || {};
    var markup = { keyboard: keys };
    if (opt.resize === true) markup['resize_keyboard'] = true;
    if (opt.once === true) markup['one_time_keyboard'] = true;
    if (opt.selective) markup['selective'] = opt.selective;
    return JSON.stringify(markup);
  },
  /* Answer */
  answerList: answerList,
/* Actions */
  getMe: function() {
    this.event('getMe', arguments);
    return this.request('/getMe');
  },
  answerQuery: function(answers, opt) {
    this.event('answerQuery', arguments);
    return this.request('/answerInlineQuery', {
      inline_query_id: answers.id, results: answers.results(),
    });
  },
  getFile: function(fileId) {
    this.event('getFile', arguments);
    var self = this;
    return this.request('/getFile', { file_id: fileId }).then(function(file) {
      var result = file.result;
      result.fileLink = self.fileLink + result.file_path;
      return result;
    });
  },
  forwardMessage: function(id, fromId, messageId) {
    this.event('forwardMessage', arguments);
    return this.request('/forwardMessage', {
      chat_id: id, from_chat_id: fromId, message_id: messageId
    });
  },
  getUserPhoto: function(id, opt) {
    this.event('getUserPhoto', arguments);
    opt = opt || {};
    var form = { user_id: id };
    if (opt.offset) form['offset'] = opt.offset;
    if (opt.limit) form['limit'] = opt.limit;
    return this.request('/getUserProfilePhotos', form);
  },
  sendAction: function(id, action) {
    this.event('sendAction', arguments);
    return this.request('/sendChatAction', {
      chat_id: id, action: action
    });
  },
  sendMessage: function(id, text, opt) {
    this.event('sendMessage', arguments);
    opt = opt || {};
    var form = props({ chat_id: id, text: text }, opt);
    if (opt.preview === false) form['disable_web_page_preview'] = true;
    return this.request('/sendMessage', form);
  },
  sendLocation: function(id, position, opt) {
    this.event('sendLocation', arguments);
    opt = opt || {};
    var form = props({
      chat_id: id, latitude: position[0], longitude: position[1]
    }, opt);
    return this.request('/sendLocation', form);
  },
  sendPhoto: function(id, photo, opt) {
    return sendFile.call(this, 'photo', id,  photo, opt);
  },
  sendAudio: function(id, audio, opt) {
    return sendFile.call(this, 'audio', id, audio, opt);
  },
  sendVoice: function(id, voice, opt) {
    return sendFile.call(this, 'voice', id, voice, opt);
  },
  sendDocument: function(id, doc, opt) {
    return sendFile.call(this, 'document', id, doc, opt);
  },
  sendSticker: function(id, sticker, opt) {
    return sendFile.call(this, 'sticker', id, sticker, opt);
  },
  sendVideo: function(id, video, opt) {
    return sendFile.call(this, 'video', id, video, opt);
  },
  setWebhook: function(url, certificate) {
    this.event('setWebhook', arguments);
    return this.request('/setWebhook', { url: url, certificate: certificate });
  },
/* Send request to server */
  request: function(url, form, data) {
    var self = this, options = { url: self.api + url, json: true };
    if (form) { options.form = form; } else { options.formData = data; };
    return new Promise(function(resolve, reject) {
      request.post(options, function(error, response, body) {
        if (error || !body.ok || response.statusCode == 404) {
          return reject(error || body.description || body.error_code || 404);
        }
        return resolve(body);
      });
    });
  },
/* Connection */
  connect: function() {
    var self = this;
    self.looping = true;
    console.log('[info] bot started');
    self.event('connect');
    self.loopFn = setInterval(function() {
      if (!self.looping) clearInterval(self.loopFn);
      if (!self.pool) return;
      self.pool = false;
      self.getUpdate().then(function() {
        if (self.retry) {
          var now = Date.now();
          var diff = (now - self.retry) / 1000;
          console.log('[info.update] reconnected after ' + diff + ' seconds');
          self.event('reconnected', {
            startTime: self.retry, endTime: now, diffTime: diff
          });
          self.retry = false;
        }
        return self.event('tick');
      }).then(function() {
        self.pool = true;
      }).catch(function(error) {
        if (self.retry === false) self.retry = Date.now();
        console.error('[error.update]', error.stack || error);
        self.event('error', { error: error });
        return Promise.reject();
      }).catch(function() {
        var seconds = self.retryTimeout / 1000;
        console.log('[info.update] reconnecting in ' + seconds + ' seconds...');
        self.event('reconnecting');
        setTimeout(function() {
          self.pool = true;
        }, self.retryTimeout);
      });
    }, self.sleep);
  },
  disconnect: function(message) {
    this.looping = false;
    console.log('[info] bot disconnected' + (message ? ': ' + message : ''));
    this.event('disconnect', message);
  },
/* Fetch updates */
  getUpdate: function() {
    var self = this;
    // Request an update
    return self.request('/getUpdates', {
      offset: self.updateId, limit: self.limit, timeout: self.timeout
    }).then(function(body) {
      // Check for update
      var data = body.result;
      if (!data.length) return Promise.resolve();
      return new Promise(function(resolve, reject) {
        self.event('update', data).then(function(output) {
          var me = extend({}, output);
          // Run update processors
          var temp = self.modRun('update', { data: data, me: me });
          data = temp.data, me = temp.me;
          // Check every message in update
          for (var update of data) {
            // Set update ID
            var nextId = ++update['update_id'];
            if (self.updateId < nextId) self.updateId = nextId;
            // Run message processors
            var temp = self.modRun('message', {
              msg: update['message'] ||
              update['inline_query'] ||
              update['chosen_inline_result'] || {},
              me: me
            });
            var msg = temp.msg, me = temp.me;
            for (var type of TYPES) {
              // Check for Telegram API documented types
              if (!(type in msg)) continue;
              me.type = type;
              // Send type event
              self.event(['*', type], msg, me);
              // Check for command
              if (type == 'text') {
                var match = RE.cmd.exec(msg.text);
                if (!match) continue;
                // Command found
                me.cmd = msg.text.split(' ');
                self.event(['/*', '/' + match[1]], msg, me);
              }
            }
          }
        }).then(resolve).catch(reject);
      });
    });
  },
  get: function(url, json) {
    return new Promise(function(resolve, reject) {
      request.get({ url: url, json: !!json }, function(er, re, data) {
        if (er || !data) return reject(er);
        return resolve(data);
      });
    });
  },
  mod: function(name, fn) {
    if (!this.modList[name]) this.modList[name] = [];
    if (this.modList[name].indexOf(fn) !== -1) return;
    this.modList[name].push(fn);
  },
  modRun: function(name, data) {
    var self = this, list = self.modList[name];
    if (!list || !list.length) return data;
    for (var fn of list) data = fn.call(self, data);
    return data;
  },
/* Events */
  on: function(types, fn) {
    var self = this;
    if (typeof types == 'string') types = [types];
    for (var type of types) {
      var event = self.eventList[type];
      if (!event) {
        self.eventList[type] = { fired: null, list: [] };
      } else if (event.fired) {
        var fired = event.fired;
        var out = fn.call(fired.self, fired.data, fired.details);
        if (out instanceof Promise) out.catch(function(error) {
          console.error('[error.event.fired]', error.stack || error);
          if (type != 'error')
            self.event('error', { error: error, data: fired.data });
        });
      }
      event = self.eventList[type].list;
      if (event.indexOf(fn) !== -1) return;
      event.push(fn);
    }
  },
  event: function(types, data, me) {
    var self = this;
    var promises = [];
    if (typeof types == 'string') types = [types];
    for (var type of types) {
      var event = this.eventList[type];
      var details = { type: type, time: Date.now() }
      var props = { self: me, data: data, details: details };
      if (!event) {
        this.eventList[type] = { fired: props, list: [] };
        continue;
      }
      event.fired = props;
      event = event.list;
      for (var fn of event) {
        promises.push(new Promise(function(resolve, reject) {
          try {
            fn = fn.call(me, data, details);
            if (fn instanceof Promise)
              return fn.then(resolve).catch(errorHandler);
            return resolve(fn);
          } catch(error) {
            return errorHandler(error);
          }
          function errorHandler(error) {
            console.error('[error.event]', error.stack || error);
            if (type != 'error')
              self.event('error', { error: error, data: data });
            return reject(error);
          }
        }));
      }
    }
    return Promise.all(promises);
  },
  clean: function(type) {
    if (!this.eventList.hasOwnProperty(type)) return;
    this.eventList[type].fired = null;
  },
  remove: function(type, fn) {
    if (!this.eventList.hasOwnProperty(type)) return;
    var event = this.eventList[type].list, index = event.indexOf(fn);
    if (index === -1) return;
    event.splice(index, 1);
  },
  destroy: function(type) {
    if (!this.eventList.hasOwnProperty(type)) return;
    delete this.eventList[type];
  }
};

/* Functions */

function props(form, opt) {
  opt = opt || {};
  form = form || {};
  // Reply to message
  if (opt.reply) form['reply_to_message_id'] = opt.reply;
  // Markdown/HTML support for message (bold, italic, urls and preformatted text)
  if (opt.parse) form['parse_mode'] = opt.parse;
  // Markup object
  if (opt.markup !== undefined) {
    if (opt.markup == 'hide' || opt.markup === false) {
      // Hide keyboard
      form['reply_markup'] = JSON.stringify({ hide_keyboard: true });
    } else if (opt.markup == 'reply') {
      // Fore reply
      form['reply_markup'] = JSON.stringify({ force_reply: true });
    } else {
      // JSON keyboard
      form['reply_markup'] = opt.markup;
    }
  }
  return form;
}

function sendFile(type, id, file, opt) {
  opt = opt || {};
  var self = this;
  var form = props({ chat_id: id }, opt);
  var url = 'send' + type.charAt(0).toUpperCase() + type.slice(1);
  // Send bot action event
  self.event(url, [].slice.call(arguments).splice(0, 1));
  // Add caption to photo
  if (type == 'photo' && opt.caption) form.caption = opt.caption;
  url = '/' + url;
  if (typeof file == 'string' && RE.url.test(file)) {
    // If url, get blob and send to user
    return getBlob(file).then(function(data) {
      if (!opt.name) {
        var match = RE.name.exec(file);
        opt.name = match ? match[0] : type + '.' + mime[data.type].extensions[0];
      }
      form[type] = {
        value: data.buffer,
        options: { filename: opt.name, contentType: data.type }
      };
      return self.request(url, null, form);
    });
  } else {
    // String as 'file_id'
    form[type] = file;
    return self.request(url, null, form);
  }
}

function getBlob(url) {
  return new Promise(function(resolve, reject) {
    request.get({ url: url, encoding: null }, function(er, re, buffer) {
      if (er || !buffer) return reject(er);
      return resolve({ buffer: buffer, type: re.headers['content-type'] });
    });
  });
}

function extend(me, input) {
  for (var obj of input) {
    for (var name in obj) {
      var key = me[name], value = obj[name];
      if (key !== undefined) {
        if (!Array.isArray(key)) me[name] = [key];
        me[name].push(value);
        continue;
      }
      me[name] = value;
    }
  }
  return me;
}

/* Exports */

module.exports = TeleBot;
