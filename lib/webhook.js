const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');

module.exports = (bot, opt) => {

    const token = '/' + bot.token;

    const host = opt.host || '0.0.0.0';
    const port = opt.port || 443;
    const key = opt.key && fs.readFileSync(opt.key);
    const cert = opt.cert && fs.readFileSync(opt.cert);

    // Create server
    const server = key && cert ?
        https.createServer({key, cert}, listener) :
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
