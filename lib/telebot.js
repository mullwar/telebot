const request = require('request');
const webhook = require('./webhook.js');
const standardUpdates = require('./updates.js');
const standardMethods = require('./methods.js');

const BUILDIN_PLUGINS_FOLDER = '../plugins/';
const BUILDIN_PLUGINS = ['regExpMessage', 'shortReply'];

const USER_PLUGIN_FOLDER = '../plugins/';

class TeleBot {

    constructor(cfg) {

        if (typeof cfg !== 'object') cfg = {token: cfg};

        if (!cfg.token || cfg.token.split(':').length !== 2) {
            throw Error('[bot.error] invalid bot token');
        }

        this.cfg = cfg;
        this.token = cfg.token;
        this.id = this.token.split(':')[0];
        this.api = `https://api.telegram.org/bot${this.token}`;
        this.fileLink = `https://api.telegram.org/file/bot${this.token}/`;

        this.pluginConfig = cfg.pluginConfig || {};

        this.usePlugins = Array.isArray(cfg.usePlugins) ? cfg.usePlugins : [];
        this.pluginFolder = cfg.pluginFolder || USER_PLUGIN_FOLDER;

        this.buildInPlugins = cfg.buildInPlugins !== undefined ? (cfg.buildInPlugins || []) : BUILDIN_PLUGINS;
        this.buildInPluginsFolder = cfg.buildInPluginsFolder || BUILDIN_PLUGINS_FOLDER;

        const poll = cfg.polling || {};

        this.proxy = poll.proxy;
        this.limit = poll.limit > 0 && poll.limit <= 100 ? poll.limit : 100;
        this.interval = poll.interval >= 0 ? poll.interval : 300;
        this.timeout = poll.timeout >= 0 ? poll.timeout : 0;
        this.retryTimeout = poll.retryTimeout >= 0 ? poll.retryTimeout : 5000;

        this.webhook = cfg.webhook;

        this.allowedUpdates = typeof cfg.allowedUpdates === 'string' || Array.isArray(cfg.allowedUpdates) ? cfg.allowedUpdates : [];
        this.maxConnections = this.webhook && Number.isInteger(this.webhook.maxConnections) ? this.webhook.maxConnections : 40;

        this.updateId = 0;
        this.loopFn = null;

        this.flags = {
            poll: false,
            retry: false,
            looping: false
        };

        this.modList = {};
        this.eventList = new Map();

        this.updateTypes = standardUpdates;

        this.processUpdate = (update, props) => {
            if (update) {
                for (let name in this.updateTypes) {
                    if (name in update) {
                        update = update[name];
                        return this.updateTypes[name].call(this, update, props);
                    }
                }
            }
        };

        // Load build-in plugins
        this.buildInPlugins.map(buildInPluginName => this.plug(require(`${this.buildInPluginsFolder}${buildInPluginName}`)));

        // Load user plugins
        this.usePlugins.map(userPluginName => this.plug(require(`${this.pluginFolder}${userPluginName}`)));

    }

    /* Plugins */

    static addMethods(methods) {

        for (let id in methods) {

            const method = methods[id];

            // If method is a function
            if (typeof method === 'function') {
                this.prototype[id] = method;
                continue;
            }

            // Set method name
            const name = method.short || id;

            // Argument function
            let argFn = method.arguments;
            if (argFn && typeof argFn !== 'function') {
                if (typeof argFn === 'string') argFn = [argFn];
                let args = argFn;
                argFn = function () {
                    const form = {};
                    args.forEach((v, i) => form[v] = arguments[i]);
                    return form;
                };
            }

            // Options function
            let optFn = method.options;

            // Create method
            this.prototype[id] = this.prototype[name] = function () {
                this.event([id, name], arguments);
                let form = {}, args = [].slice.call(arguments);
                let options = args[args.length - 1], fnOptions = {};
                if (typeof options !== 'object') options = {};
                if (argFn) form = argFn.apply(this, args);
                if (optFn) fnOptions = optFn.apply(this, [].concat(form, options));
                form = this.properties(form, Object.assign(options, fnOptions));
                return this.request(`/${id}`, form).then(method.then || (re => re && re.result));
            };

        }
    }

    /* Connection */

    plug(module) {

        const {id, defaultConfig, plugin} = module;

        if (id) {

            const userConfig = this.pluginConfig[id];
            const isConfigObject = Object.prototype.toString.call(defaultConfig) === '[object Object]';

            let config;
            if (isConfigObject) {
                config = Object.assign(defaultConfig, userConfig);
            } else {
                config = userConfig || defaultConfig;
            }

            plugin.call(this, this, config || {});

            console.log(`[bot.plugin] loaded '${id}' plugin`);

        } else {
            console.log('[bot.plugin] skip plugin without id');
        }

    }

    start() {

        const f = this.flags;

        // Set webhook
        if (this.webhook) {

            let {url, cert} = this.webhook;
            if (url) url = `${url}/${this.token}`;

            return this.setWebhook(url, cert, this.allowedUpdates, this.maxConnections).then(() => {

                console.log(`[bot.webhook] set to "${url}"`);
                return webhook.call(this, this, this.webhook);

            }).catch((error) => {

                console.error('[bot.error.webhook]', error);
                this.event('error', {error});

            });

        }

        // Delete webhook
        this.setWebhook().then((response) => {
            f.poll = true;

            if (response.description === 'Webhook was deleted') {
                console.log('[bot.webhook] webhook was deleted');
            }

            console.log('[bot.info] bot started');

        }).catch((error) => {

            console.error('[bot.error.webhook]', error);
            this.event('error', {error});

        });

        f.looping = true;

        this.event('start');

        // Global loop function
        this.loopFn = setInterval(() => {

            // Stop on false looping flag
            if (!f.looping) clearInterval(this.loopFn);

            // Skip processing on false poll flag
            if (!f.poll) return;

            f.poll = false;

            // Get updates
            this.getUpdates().then(() => {

                // Retry connecting
                if (f.retry) {

                    const now = Date.now();
                    const diff = (now - f.retry) / 1000;

                    console.log(`[bot.info.update] reconnected after ${diff} seconds`);
                    this.event('reconnected', {
                        startTime: f.retry, endTime: now, diffTime: diff
                    });

                    f.retry = false;

                }

                // Tick
                return this.event('tick');

            }).then(() => {

                // Seems okay for the next poll
                f.poll = true;

            }).catch(error => {

                // Set retry flag as current date (for timeout calculations)
                if (f.retry === false) f.retry = Date.now();

                console.error(`[bot.error.update]`, error.stack || error);
                this.event(['error', 'error.update'], {error});

                return Promise.reject();

            }).catch(() => {

                const seconds = this.retryTimeout / 1000;
                console.log(`[bot.info.update] reconnecting in ${seconds} seconds...`);
                this.event('reconnecting');

                // Set reconnecting timeout
                setTimeout(() => (f.poll = true), this.retryTimeout);

            });

        }, this.interval);

    }

    /* Stop looping */

    connect(...args) {
        return this.start(...args);
    }

    /* Fetch updates */

    stop(message) {
        this.flags.looping = false;
        console.log(`[bot.info] bot stopped ${message ? ': ' + message : ''}`);
        this.event('stop', message);
    }

    /* Recive updates */

    getUpdates(offset = this.updateId, limit = this.limit, timeout = this.timeout, allowed_updates = this.allowedUpdates) {

        // Request updates from Telegram server
        return this.request('/getUpdates', {
            offset, limit, timeout, allowed_updates
        }).then(body =>
            this.receiveUpdates(body.result)
        );

    }

    /* Send request to server */

    receiveUpdates(updateList) {

        // Globals
        var mod, props = {};
        var promise = Promise.resolve();

        // No updates
        if (!updateList.length) return promise;

        // We have updates
        return this.event('update', updateList).then(eventProps => {

            // Run update list modifiers
            mod = this.modRun('updateList', {
                updateList, props: extendProps(props, eventProps)
            });

            updateList = mod.updateList;
            props = mod.props;

            // Every Telegram update
            for (let update of updateList) {

                // Update ID
                const nextId = ++update.update_id;
                if (this.updateId < nextId) this.updateId = nextId;

                // Run update modifiers
                mod = this.modRun('update', {update, props});

                update = mod.update;
                props = mod.props;

                // Process update
                promise = promise.then(() => this.processUpdate(update, props));

            }

            return promise;

        }).catch(error => {

            console.log('[bot.error]', error.stack || error);
            this.event('error', {error});

            // Don't trigger server reconnect
            return Promise.resolve();

        });

    }

    /* Modifications */

    request(url, form, data) {

        const options = {
            url: this.api + url,
            json: true
        };

        if (this.proxy) options.proxy = this.proxy;

        if (form) {
            options.form = form;
        } else {
            for (let item in data) {
                const type = typeof data[item];
                if (type === 'string' || type === 'object') continue;
                data[item] = JSON.stringify(data[item]);
            }
            options.formData = data;
        }

        return new Promise((resolve, reject) => {
            request.post(options, (error, response, body) => {
                if (error || !body || !body.ok || response.statusCode === 404) {
                    return reject(error || body || 404);
                }
                return resolve(body);
            });
        });

    }

    mod(names, fn) {
        if (typeof names === 'string') names = [names];
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

    /* Events */

    removeMod(name, fn) {
        let list = this.modList[name];
        if (!list) return false;
        let index = list.indexOf(fn);
        if (index === -1) return false;
        list.splice(index, 1);
        return true;
    }

    on(types, fn, opt) {

        if (!opt) opt = {};
        if (!Array.isArray(types)) types = [types];

        const eventList = this.eventList;

        for (let type of types) {

            if (!eventList.has(type)) {

                eventList.set(type, {fired: null, list: [fn]});

            } else {

                const event = eventList.get(type);

                if (event.list.includes(fn)) continue;
                event.list.push(fn);

                if (opt.fired && event.fired) {

                    let fired = event.fired;

                    new Promise((resolve, reject) => {

                        let output = fn.call(fired.self, fired.data, fired.self, fired.details);

                        if (output instanceof Promise) {
                            output.then(resolve).catch(reject);
                        } else {
                            resolve(output);
                        }

                    }).catch(error => {
                        eventPromiseError.call(this, type, fired, error);
                    });

                    if (opt.cleanFired) {
                        eventList.set(type, event.fired = null);
                    }

                }

            }

        }
    }

    event(types, data, self) {

        let promises = [];

        if (!Array.isArray(types)) types = [types];

        for (let type of types) {

            let event = this.eventList.get(type);
            let details = {type, time: Date.now()};
            let fired = {self, data, details};

            if (!event) {
                this.eventList.set(type, {fired, list: []});
                continue;
            }

            event.fired = fired;
            event = event.list;

            for (let fn of event) {

                promises.push((new Promise((resolve, reject) => {
                    let that = this;

                    details.remove = (function (fn) {
                        return () => that.removeEvent(type, fn);
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
        const eventList = this.eventList;
        if (!eventList.has(type)) return false;
        eventList.set(type, eventList.get(type).fired = null);
        return true;
    }

    removeEvent(type, fn) {
        const eventList = this.eventList;
        if (!eventList.has(type)) return false;
        let event = eventList.get(type).list;
        let index = event.indexOf(fn);
        if (index === -1) return false;
        event.splice(index, 1);
        return true;
    }

    /* Process global properties */

    destroyEvent(type) {
        let eventList = this.eventList;
        if (!eventList.has(type)) return false;
        eventList.delete(type);
        return true;
    }

    /* Method adder */

    properties(form = {}, opt = {}) {

        const parseMode = opt.parseMode || opt.parse;
        const replyToMessage = opt.replyToMessage || opt.reply;
        const replyMarkup = opt.replyMarkup || opt.markup;
        const notification = opt.notification === false || opt.notify === false;
        const webPreview = opt.webPreview === false || opt.preview === false;

        if (replyToMessage) form.reply_to_message_id = replyToMessage;
        if (parseMode) form.parse_mode = parseMode;
        if (notification) form.disable_notification = true;
        if (webPreview) form.disable_web_page_preview = true;

        // Markup object
        if (replyMarkup !== undefined) {
            if (replyMarkup === 'hide' || replyMarkup === false) {
                // Hide keyboard
                form.reply_markup = JSON.stringify({hide_keyboard: true});
            } else if (replyMarkup === 'reply') {
                // Fore reply
                form.reply_markup = JSON.stringify({force_reply: true});
            } else {
                // JSON keyboard
                form.reply_markup = JSON.stringify(replyMarkup);
            }
        }

        return (this.modRun('property', {form, options: opt})).form;

    }
}

/* Add standard methods */

TeleBot.addMethods(standardMethods);

/* Functions */

function eventPromiseError(type, fired, error) {
    return new Promise((resolve, reject) => {
        console.error('[bot.error.event]', error.stack || error);
        if (type !== 'error' && type !== 'error.event') {
            this.event(['error', 'error.event'], {error, data: fired.data})
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
