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

  describe('#sendPhoto', x => {
    const list = {
      'url': 'https://telegram.org/img/t_logo.png',
      'file system (stream)':
        fs.createReadStream(`${__dirname}/data/image2.jpg`),
      'file system (string)': `${__dirname}/data/image.jpg`,
      'file_id': 'AgADBAADrKoxG3SIWwSUAxUZiXbM6oy1JRkABOazQnPYZNG4ThQCAAEC'
    };
    for (let name in list) {
      it(`should send image form ${ name }`, done => {
        bot.sendPhoto(USER, list[name]).then(re => {
          assert(re.ok && Array.isArray(re.result.photo));
        }).then(done).catch(done);
      });
    }
  });

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
