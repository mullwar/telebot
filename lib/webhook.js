'use strict';

const
  fs = require('fs'),
  url = require('url'),
  http = require('http'),
  https = require('https');

// Allowed ports
const PORTS = [443, 80, 88, 8443];

module.exports = function(opt) {

  let
    host = opt.host || '0.0.0.0',
    port = opt.port || 443,
    key = opt.key && fs.readFileSync(opt.key),
    cert = opt.cert && fs.readFileSync(opt.cert);

  // Check port
  if (PORTS.indexOf(port) == -1) {
    this.event('error', { error });
    console.error(`[bot.error.webhook] allowed ports: ${ PORTS.join(', ') }`);
    return;
  }

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
    console.log(`[bot.webhook] ${ req.method } ${ req.url }`);
    res.end();
  }

};
