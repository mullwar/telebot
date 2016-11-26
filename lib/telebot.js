'use strict';

const
  request = require('request'),
  webhook = require('./webhook.js'),
  standardUpdates = require('./updates.js'),
  standardMethods = require('./methods.js');

/* Telegram Bot */

class TeleBot {

  constructor(cfg) {

    if (typeof cfg != 'object') cfg = { token: cfg };

    if (!cfg.token || cfg.token.split(':').length != 2) {
      throw Error('[bot.error] invalid bot token');
    }

    this.cfg = cfg;
    this.token = cfg.token;
    this.id = this.token.split(':')[0];
    this.api = `https://api.telegram.org/bot${ this.token }`;
    this.fileLink = `https://api.telegram.org/file/bot${ this.token }/`;

    let poll = cfg.polling;

    // Migration
    if (!poll) {
      if (cfg.pooling) {
        poll = cfg.pooling;
        console.warn('[bot.warning] use "polling" option instead of "pooling"!');
      } else {
        poll = {};
        // Set cfg.polling
        for (let name of ['limit', 'timeout', 'retryTimeout']) {
          poll[name] = cfg[name];
        }
        // cfg.sleep renamed to cfg.polling.interval
        poll.interval = cfg.sleep;
      }
    }

    this.limit = poll.limit > 0 && poll.limit <= 100 ? poll.limit : 100;
    this.interval = poll.interval >= 0 ? poll.interval : 1000;
    this.timeout = poll.timeout >= 0 ? poll.timeout : 0;
    this.retryTimeout = poll.retryTimeout >= 0 ? poll.retryTimeout : 5000;

    this.webhook = cfg.webhook;

    this.updateId = 0;
    this.loopFn = null;

    this.flags = {
      poll: false,
      retry: false,
      looping: false
    };

    this.modList = {};
    this.eventList = {};

    this.updateTypes = standardUpdates;

    this.processUpdate = (update, props) => {
      for (let name in this.updateTypes) {
        if (name in update) {
          update = update[name];
          return this.updateTypes[name].call(this, update, props);
        }
      }
    };

  }

  /* Modules */

  use(fn) {
    return fn.call(this, this, this.cfg.modules);
  }

  /* Connection */

  connect() {

    const f = this.flags;

    // Set webhook
    if (this.webhook) {
      let { url, cert } = this.webhook;
      if (url) url = `${ url }/${ this.token }`;
      return this.setWebhook(url, cert).then(x => {
        console.log(`[bot.webhook] set to "${url}"`);
        return webhook.call(this, this, this.webhook);
      }).catch(error => {
        console.error('[bot.error.webhook]', error);
        this.event('error', { error });
        return;
      });
    
    }

    // Delete webhook
    this.setWebhook().then(data => {
      f.poll = true;
      if (data.description == 'Webhook was deleted')
        console.log('[bot.webhook] webhook was deleted');
      console.log('[bot.info] bot started');
    }).catch(error => {
      console.error('[bot.error.webhook]', error);
      this.event('error', { error });
      return;
    });

    f.looping = true;

    this.event('connect');

    // Global loop function
    this.loopFn = setInterval(x => {

      // Stop on false looping flag
      if (!f.looping) clearInterval(this.loopFn);

      // Skip processing on false poll flag
      if (!f.poll) return;

      f.poll = false;

      // Get updates
      this.getUpdates().then(x => {

        // Retry connecting
        if (f.retry) {

          const now = Date.now();
          const diff = (now - f.retry) / 1000;

          console.log(`[bot.info.update] reconnected after ${ diff } seconds`);
          this.event('reconnected', {
            startTime: f.retry, endTime: now, diffTime: diff
          });

          f.retry = false;

        }

        // Tick
        return this.event('tick');

      }).then(x => {

        // Seems okay for the next poll
        f.poll = true;

      }).catch(error => {

        // Set retry flag as current date (for timeout calculations)
        if (f.retry === false) f.retry = Date.now();

        console.error(`[bot.error.update]`, error.stack || error);
        this.event(['error', 'error.update'], { error });

        return Promise.reject();

      }).catch(x => {

        const seconds = this.retryTimeout / 1000;
        console.log(`[bot.info.update] reconnecting in ${ seconds } seconds...`);
        this.event('reconnecting');

        // Set reconnecting timeout
        setTimeout(x => (f.poll = true), this.retryTimeout);

      });

    }, this.interval);

  }

  /* Stop looping */

  disconnect(message) {
    this.flags.looping = false;
    console.log(`[bot.info] bot disconnected ${ message ? ': ' + message : '' }`);
    this.event('disconnect', message);
  }

  /* Fetch updates */

  getUpdates(offset=this.updateId, limit=this.limit, timeout=this.timeout) {

    // Request updates from Telegram server
    return this.request('/getUpdates', {
      offset, limit, timeout
    }).then(body =>
      this.receiveUpdates(body.result)
    );
  
  }

  /* Recive updates */

  receiveUpdates(updateList) {

    // Globals
    var
      mod,
      props = {},
      promise = Promise.resolve();

    // No updates
    if (!updateList.length) return promise;

    // We have updates
    return this.event('update', updateList).then(eventProps => {

      // Run update list modifiers
      mod = this.modRun('updateList', {
        list: updateList,
        props: extendProps(props, eventProps)
      });

      updateList = mod.list;
      props = mod.props;

      // Every Telegram update
      for (let update of updateList) {

        // Update ID
        const nextId = ++update.update_id;
        if (this.updateId < nextId) this.updateId = nextId;

        // Run update modifiers
        mod = this.modRun('update', { update, props });

        update = mod.update;
        props = mod.props;

        // Process update
        promise = promise.then(x => this.processUpdate(update, props));

      }

      return promise;

    }).catch(error => {

      console.log('[bot.error]', error.stack || error);
      this.event('error', { error });

      // Don't trigger server reconnect
      return Promise.resolve();

    });

  }

  /* Send request to server */

  request(url, form, data) {
    const options = { url: this.api + url, json: true };
    if (form) {
      options.form = form;
    } else {
      for (let item in data) {
        const type = typeof data[item];
        if (type == 'string' || type == 'object') continue;
        data[item] = JSON.stringify(data[item]);
      }
      options.formData = data
    };
    return new Promise((resolve, reject) => {
      request.post(options, (error, response, body) => {
        if (error || !body.ok || response.statusCode == 404) {
          return reject(error || body || 404);
        }
        return resolve(body);
      });
    });
  }

  /* Modifications */

  mod(names, fn) {
    if (typeof names == 'string') names = [names];
    const mods = this.modList;
    for (let name of names) {
      if (!mods[name]) mods[name] = [];
      if (mods[name].includes(fn)) return;
      mods[name].push(fn);
    }
    return fn;
  }

  modRun(name, data) {
    const list = this.modList[name];
    if (!list || !list.length) return data;
    for (let fn of list) data = fn.call(this, data);
    return data;
  }

  removeMod(name, fn) {
    let list = this.modList[name];
    if (!list) return false;
    let index = list.indexOf(fn);
    if (index == -1) return false;
    list.splice(index, 1);
    return true;
  }

  /* Events */

  on(types, fn, opt) {
    if (!opt) opt = {};
    if (typeof types == 'string') types = [types];
    for (let type of types) {
      let event = this.eventList[type];
      if (!event) {
        this.eventList[type] = { fired: null, list: [fn] };
      } else {
        if (event.list.includes(fn)) continue;
        event.list.push(fn);
        if (opt.fired && event.fired) {
          let fired = event.fired;
          new Promise((resolve, reject) => {
            let output = fn.call(fired.self, fired.data, fired.self, fired.details);
            if (output instanceof Promise) output.then(resolve).catch(reject);
            else resolve(output);
          }).catch(error => {
            eventPromiseError.call(this, type, fired, error);
          });
          if (opt.cleanFired) this.eventList[type].fired = null;
        }
      }
    }
  }

  event(types, data, self) {
    let promises = [];
    if (typeof types == 'string') types = [types];
    for (let type of types) {
      let event = this.eventList[type];
      let details = { type, time: Date.now() };
      let fired = { self, data, details };
      if (!event) {
        this.eventList[type] = { fired, list: [] };
        continue;
      }
      event.fired = fired;
      event = event.list;
      for (let fn of event) {
        promises.push((new Promise((resolve, reject) => {
          let that = this;
          details.remove = (function(fn) {
            return x => that.removeEvent(type, fn);
          }(fn));
          fn = fn.call(self, data, self, details);
          if (fn instanceof Promise) {
            fn.then(resolve).catch(reject);
          } else {
            resolve(fn);
          }
        })).catch(error => {
          eventPromiseError.call(this, type, fired, error);
        }));
      }
    }
    return Promise.all(promises);
  }

  cleanEvent(type) {
    let events = this.eventList;
    if (!events.hasOwnProperty(type)) return false;
    events[type].fired = null;
    return true;
  }

  removeEvent(type, fn) {
    let events = this.eventList;
    if (!events.hasOwnProperty(type)) return false;
    let event = events[type].list;
    let index = event.indexOf(fn);
    if (index == -1) return false;
    event.splice(index, 1);
    return true;
  }

  destroyEvent(type) {
    let events = this.eventList;
    if (!events.hasOwnProperty(type)) return false;
    delete events[type];
    return true;
  }

  /* Process global properties */

  properties(form={}, opt={}) {

    // Reply to message
    if (opt.reply) form.reply_to_message_id = opt.reply;

    // Markdown/HTML support for message
    if (opt.parse) form.parse_mode = opt.parse;

    // User notification
    if (opt.notify === false) form.disable_notification = true;

    // Web preview
    if (opt.preview === false) form.disable_web_page_preview = true;

    // Markup object
    if (opt.markup !== undefined) {
      if (opt.markup == 'hide' || opt.markup === false) {
        // Hide keyboard
        form.reply_markup = JSON.stringify({ hide_keyboard: true });
      } else if (opt.markup == 'reply') {
        // Fore reply
        form.reply_markup = JSON.stringify({ force_reply: true });
      } else {
        // JSON keyboard
        form.reply_markup = opt.markup;
      }
    }

    return (this.modRun('property', { form, options: opt })).form;

  }

  /* Method adder */

  static addMethods(methods) {

    for (let id in methods) {

      const method = methods[id];

      // If method is a function
      if (typeof method == 'function') {
        this.prototype[id] = method;
        continue;
      }

      // Set method name
      const name = method.short || id;

      // Argument function
      let argFn = method.arguments;
      if (argFn && typeof argFn != 'function') {
        if (typeof argFn == 'string') argFn = [argFn];
        let args = argFn;
        argFn = function() {
          const form = {};
          args.forEach((v, i) => form[v] = arguments[i]);
          return form;
        };
      }

      // Options function
      let optFn = method.options;

      // Create method
      this.prototype[name] = function() {
        this.event(name, arguments);
        let form = {}, args = [].slice.call(arguments);
        let options = args[args.length - 1];
        if (typeof options != 'object') options = {};
        if (argFn) form = argFn.apply(this, args);
        if (optFn) options = optFn.apply(this, [].concat(form, options));
        form = this.properties(form, options);
        let request = this.request(`/${id}`, form);
        if (method.then) request = request.then(method.then);
        return request;
      };

    }
  }
};

/* Add standard methods */

TeleBot.addMethods(standardMethods);

/* Functions */

function eventPromiseError(type, fired, error) {
  return new Promise((resolve, reject) => {
    console.error('[bot.error.event]', error.stack || error);
    if (type != 'error' && type != 'error.event') {
      this.event(['error', 'error.event'], { error, data: fired.data })
        .then(resolve).catch(reject);
    } else {
      resolve();
    }
  });
}

function extendProps(props, input) {
  for (let obj of input) {
    for (let naprops in obj) {
      const key = props[naprops], value = obj[naprops];
      if (key !== undefined) {
        if (!Array.isArray(key)) props[naprops] = [key];
        props[naprops].push(value);
        continue;
      }
      props[naprops] = value;
    }
  }
  return props;
}

/* Exports */

module.exports = TeleBot;
