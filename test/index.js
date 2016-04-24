'use strict';

const
  fs = require('fs'),
  assert = require('assert'),
  TeleBot = require('../lib/telebot.js');

const TOKEN = process.env.TEST_TELEBOT_TOKEN;
const USER = process.env.TEST_TELEBOT_USER;

if (!TOKEN) throw Error('TEST_TELEBOT_TOKEN required');
if (!USER) throw Error('TEST_TELEBOT_USER required');

describe('TeleBot', x => {

  const bot = new TeleBot(TOKEN);

  describe('#getMe', x => {
    it('should return an User object', done => {
      bot.getMe().then(re => {
        assert(re.ok && re.result.id == bot.id);
      }).then(done).catch(done);
    });
  });

  describe('#sendMessage', x => {
    it('should send a message', done => {
      const str = 'hello_test';
      bot.sendMessage(USER, str).then(re => {
        assert(re.ok && re.result.text == str);
      }).then(done).catch(done);
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
    describe(`#${ method }`, x => {
      for (let name in data) {
        it(`should send form ${ name }`, done => {
          bot[method](USER, data[name]).then(re => {
            assert(re.ok);
          }).then(done).catch(done);
        });
      }
    });
  }

  describe('#sendLocation', x => {
    it('should send a location', done => {
      bot.sendLocation(USER, [37.641422, -115.783253]).then(re => {
        assert(re.ok && re.result.location);
      }).then(done).catch(done);
    });
  });

  describe('#sendVenue', x => {
    it('should send a venue', done => {
      bot.sendVenue(USER, [56.9713962, 23.9890801], 'This', 'that').then(re => {
        assert(re.ok && re.result.venue);
      }).then(done).catch(done);
    });
  });

  describe('#sendContact', x => {
    it('should send a contact', done => {
      bot.sendContact(USER, '112', 'First', 'Last').then(re => {
        assert(re.ok && re.result.contact);
      }).then(done).catch(done);
    });
  });

  describe('#sendAction', x => {
    it('should send a chat action', done => {
      bot.sendAction(USER, 'typing').then(re => {
        assert(re.ok && re.result == true);
      }).then(done).catch(done);
    });
  });

});
