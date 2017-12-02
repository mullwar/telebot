const fs = require('fs');
const test = require('ava');
const TeleBot = require('../lib/telebot.js');

// Globals
var bot;

// Enviroment data

let {
    TEST_TELEBOT_TOKEN: TOKEN,
    TEST_TELEBOT_USER: USER
} = process.env;

test('bot environment', t => {

    t.true(!!TOKEN, 'TEST_TELEBOT_TOKEN required');
    t.true(!!USER, 'TEST_TELEBOT_USER required');

});

test('bot object', t => {

    const newSet = {
        token: TOKEN,
        polling: {
            interval: 100,
            limit: 50,
            timeout: 0,
            retryTimeout: 5000
        }
    };

    function check(bot) {
        t.is(bot.token, TOKEN);
        t.is(bot.id, TOKEN.split(':')[0]);
    }

    check(new TeleBot(TOKEN));
    check(bot = new TeleBot(newSet));

    for (let name in newSet.polling) {
        t.is(bot[name], newSet.polling[name]);
    }

    // Start
    bot.start();
    t.not(bot.loopFn, null);
    t.deepEqual(bot.flags, {looping: true, poll: false, retry: false});

    // Stop
    bot.stop();
    t.false(bot.flags.looping);

});

test('events', t => {

    t.plan(9);

    function len(event) {
        return bot.eventList.get(event).list.length;
    }

    function count() {
        return bot.eventList.size;
    }

    var delMe = () => {
    };

    t.is(count(), 2);

    // Set
    bot.on('start', () => {
    });
    bot.on('start', delMe);
    bot.on('custom', () => {
    });
    bot.on('custom', () => {
    });
    bot.on('custom', () => {
    });

    // Count
    t.is(len('custom'), 3);
    t.is(len('start'), 2);
    t.is(count(), 3);

    // Remove
    t.true(bot.removeEvent('start', delMe));
    t.is(len('start'), 1);

    // Clean
    t.true(bot.cleanEvent('custom'));

    // Destroy
    t.true(bot.destroyEvent('custom'));
    t.is(count(), 2);

});

test('mods', t => {

    const defModCount = bot.buildInPlugins.length + bot.usePlugins.length;

    function len(event) {
        return bot.modList[event].length;
    }

    var delMe = x => x;

    t.is(all(bot.modList), defModCount);

    // Set
    bot.mod('custom', x => ++x);
    bot.mod('custom', x => ++x);
    bot.mod('custom', delMe);
    bot.mod('custom', x => ++x);

    // Count
    t.is(len('custom'), 4);
    t.is(all(bot.modList), 1 + defModCount);

    // Run
    t.is(bot.modRun('custom', 5), 8);

    // Remove
    t.true(bot.removeMod('custom', delMe));
    t.false(bot.removeMod('custom'));
    t.false(bot.removeMod('not_found'));

    t.is(len('custom'), 3);
    t.is(all(bot.modList), 1 + defModCount);

});

test('bot.answerList', t => {

    const id = 8;

    const opt = {
        cacheTime: 200,
        nextOffset: 3457,
        personal: true
    };

    const answers = bot.answerList(id, opt);

    t.is(answers.id, id);

    for (let key in opt) {
        t.is(answers[key], opt[key]);
    }

});

test('bot.getMe', t => {
    return bot.getMe().then(data => {
        t.true(data && data.id == bot.id);
    });
});

test('bot.sendMessage', t => {
    let str = '#hello_test';
    return bot.sendMessage(USER, str).then(re => {
        t.true(re.text == str);
    });
});

const sendMethods = {
    sendPhoto: {
        'url': 'https://telegram.org/img/t_logo.png',
        'buffer': fs.readFileSync(`${__dirname}/data/image.jpg`),
        'file system': `${__dirname}/data/image.jpg`
    },
    sendAudio: {
        'buffer': fs.readFileSync(`${__dirname}/data/audio.mp3`),
        'file system': `${__dirname}/data/audio.mp3`
    },
    sendDocument: {
        'buffer': fs.readFileSync(`${__dirname}/data/file.txt`),
        'file system': `${__dirname}/data/file.txt`
    },
    sendSticker: {
        'url': 'http://www.gstatic.com/webp/gallery/1.webp',
        'buffer': fs.readFileSync(`${__dirname}/data/sticker.webp`),
        'file system': `${__dirname}/data/sticker.webp`
    },
    sendVideo: {
        'buffer': fs.readFileSync(`${__dirname}/data/video.mp4`),
        'file system': `${__dirname}/data/video.mp4`
    },
    sendVoice: {
        'buffer': fs.readFileSync(`${__dirname}/data/voice.m4a`),
        'file system': `${__dirname}/data/voice.m4a`
    }
};

for (let method in sendMethods) {
    let data = sendMethods[method];
    test(`bot.${ method }`, t => {
        let promise = Promise.resolve();
        for (let name in data) {
            promise = promise.then(() => {
                return bot[method](USER, data[name]).then(re => t.true(!!re));
            });
        }
        return promise;
    });
}

test('bot.sendLocation', t => {
    let loc = [37.641401, -115.783262];
    return bot.sendLocation(USER, loc).then(re => {
        t.true(!!re);
        t.deepEqual(re.location, {latitude: loc[0], longitude: loc[1]});
    });
});

test('bot.sendVenue', t => {
    return bot.sendVenue(USER, [56.9713962, 23.9890801], 'A', 'B').then(re => {
        t.truthy(re.venue);
    });
});

test('bot.sendContact', t => {
    return bot.sendContact(USER, '112', 'First', 'Last').then(re => {
        t.truthy(re.contact);
    });
});

test('bot.sendAction', t => {
    return bot.sendAction(USER, 'typing').then(re => {
        t.true(!!re);
    });
});

test('bot.editMessageText', t => {
    return bot.sendMessage(USER, 'text').then(re => {
        const chatId = USER;
        const messageId = re.message_id;
        return bot.editMessageText({chatId, messageId}, 'text OK');
    }).then(re => t.true(!!re));
});

test('bot.editMessageCaption', t => {
    const photo = 'https://telegram.org/img/tl_card_destruct.gif';
    return bot.sendPhoto(USER, photo, {caption: 'caption'}).then(re => {
        const chatId = USER;
        const messageId = re.message_id;
        return bot.editMessageCaption({chatId, messageId}, 'caption OK');
    }).then(re => t.true(!!re));
});

test('bot.editMessageReplyMarkup', t => {
    let replyMarkup = bot.inlineKeyboard([
        [bot.inlineButton('test', {callback: 1})]
    ]);
    return bot.sendMessage(USER, 'markup', {replyMarkup}).then(re => {
        const chatId = USER;
        const messageId = re.message_id;
        replyMarkup = bot.inlineKeyboard([[bot.inlineButton('OK', {callback: 2})]]);
        return bot.editMessageReplyMarkup({chatId, messageId}, replyMarkup);
    }).then(re => t.true(!!re));
});

// Functions

function all(obj) {
    return Object.keys(obj).length;
}
