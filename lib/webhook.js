'use strict';

const
  fs = require('fs'),
  url = require('url'),
  http = require('http'),
  https = require('https');

module.exports = (bot, opt) => {

  const token = '/' + bot.token;

  let
    host = opt.host || '0.0.0.0',
    port = opt.port || 443,
    key = opt.key && fs.readFileSync(opt.key),
    cert = opt.cert && fs.readFileSync(opt.cert);

  // Create server
  const server = key && cert ?
    https.createServer({ key, cert }, listener) :
      http.createServer(listener);

  // Start server
  server.listen(port, host, x => {
    console.log(`[bot.webhook] started${ key ? ' secure' : ''} server on "${ host }:${ port }"`);
  });

  // Request listener
  function listener(req, res) {
    if (req.url == token && req.method == 'POST') {
      var json = '';
      req.on('data', data => json += data);
      req.on('end', x => {
        res.end();
        bot.receiveUpdates([JSON.parse(json)], true);
      });
    }
  }

};
