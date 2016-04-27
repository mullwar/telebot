const
  test = require('ava'),
  TeleBot = require('../lib/telebot.js');

// Globals
var bot;

// Enviroment data
const {
  TEST_TELEBOT_TOKEN: TOKEN,
  TEST_TELEBOT_USER: USER
} = process.env;


test('bot environment', t => {

  t.true(!!TOKEN, 'TEST_TELEBOT_TOKEN required');
  t.true(!!USER, 'TEST_TELEBOT_USER required');

});

test('bot object', t => {

  const set = {
    token: TOKEN,
    limit: 30,
    sleep: 500,
    timeout: 100,
    retryTimeout: 10000
  };

  function check(bot) {
    t.is(bot.token, TOKEN);
    t.is(bot.id, TOKEN.split(':')[0]);
  } 

  // Check new objects
  check(new TeleBot(TOKEN));
  
  check(bot = new TeleBot(set));
  for (let name in set) t.is(bot[name], set[name]);

  // Connect
  bot.connect();
  t.not(bot.loopFn, null);
  t.deepEqual(bot.flags, { looping: true, pool: true, retry: false });

  // Disconnect
  bot.disconnect();
  t.false(bot.flags.looping);

});

test('events', t => {

  t.plan(9);

  function len(event) {
    return bot.eventList[event].list.length;
  }

  var delMe = x => {};

  t.is(all(bot.eventList), 2);

  // Set
  bot.on('connect', x => {});
  bot.on('connect', delMe);
  bot.on('custom', x => {});
  bot.on('custom', x => {});

  // Count
  t.is(len('custom'), 2);
  t.is(len('connect'), 2);
  t.is(all(bot.eventList), 3);
  
  // Remove
  t.true(bot.removeEvent('connect', delMe));
  t.is(len('connect'), 1);

  // Clean
  t.true(bot.cleanEvent('custom'));

  // Destroy
  t.true(bot.destroyEvent('custom'));
  t.is(all(bot.eventList), 2);

});

test('mods', t => {

  function len(event) {
    return bot.modList[event].length;
  }

  var delMe = x => x;

  t.is(all(bot.modList), 0);

  // Set
  bot.mod('custom', x => ++x);
  bot.mod('custom', x => ++x);
  bot.mod('custom', delMe);
  bot.mod('custom', x => ++x);

  // Count
  t.is(len('custom'), 4);
  t.is(all(bot.modList), 1);

  // Run
  t.is(bot.modRun('custom', 5), 8);

  // Remove
  t.true(bot.removeMod('custom', delMe));
  t.false(bot.removeMod('custom'));
  t.false(bot.removeMod('not_found'));

  t.is(len('custom'), 3);
  t.is(all(bot.modList), 1);

});

test('bot.getMe', t => {
  return bot.getMe().then(re => {
    t.true(re.ok && re.result.id == bot.id);
  });
});

test('bot.sendMessage', t => {
  let str = '#hello_test';
  return bot.sendMessage(USER, str).then(re => {
    t.true(re.ok && re.result.text == str);
  });
});

const sendMethods = {
  sendPhoto: {
    'url': 'https://telegram.org/img/t_logo.png',
    'file system': `${__dirname}/data/image.jpg`
  },
  sendAudio: {
    'file system': `${__dirname}/data/audio.mp3`
  },
  sendDocument: {
    'url': 'http://www.google.com/humans.txt',
    'file system': `${__dirname}/data/file.txt`
  },
  sendSticker: {
    'url': 'http://www.gstatic.com/webp/gallery/1.webp',
    'file system': `${__dirname}/data/sticker.webp`
  },
  sendVideo: {
    'file system': `${__dirname}/data/video.mp4`
  },
  sendVoice: {
    'file system': `${__dirname}/data/voice.m4a`
  }
}

for (let method in sendMethods) {
  let data = sendMethods[method];
  test(`bot.${ method }`, t => {
    for (let name in data) {
      bot[method](USER, data[name]).then(re => t.true(re.ok));
    }
  });
}

test('bot.sendLocation', t => {
  let loc = [37.641401, -115.783262];
  return bot.sendLocation(USER, loc).then(re => {
    t.true(re.ok);
    t.deepEqual(re.result.location, { latitude: loc[0], longitude: loc[1] });
  });
});

test('bot.sendVenue', t => {
  return bot.sendVenue(USER,  [56.9713962, 23.9890801], 'A', 'B').then(re => {
    t.truthy(re.ok && re.result.venue);
  });
});

test('bot.sendContact', t => {
  return bot.sendContact(USER, '112', 'First', 'Last').then(re => {
    t.truthy(re.ok && re.result.contact);
  });
});

test('bot.sendAction', t => {
  return bot.sendAction(USER, 'typing').then(re => {
    t.true(re.ok && re.result == true);
  });
});

// Functions

function all(obj) {
  return Object.keys(obj).length;
}