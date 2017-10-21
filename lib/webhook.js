const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');

module.exports = (bot, opt) => {

    const token = '/' + bot.token;

    const host = opt.host || '0.0.0.0';
    const port = opt.port || 443;
    const path = url.parse(opt.url).pathname;
    const key = opt.key && fs.readFileSync(opt.key);
    const cert = opt.cert && fs.readFileSync(opt.cert);

    // Create server
    const server = key && cert ?
        https.createServer({key, cert}, listener) :
        http.createServer(listener);

    // Start server
    server.listen(port, host, () => {
        if (bot.logging) {
            console.log(`[bot.webhook] started${ key ? ' secure' : ''} server on "${ host }:${ port }"`);
        }
    });

    // Request listener
    function listener(req, res) {

        const botUrl = path && path !== '/' ? path : '';
        const fullPath = botUrl + token;

        if (req.url === fullPath && req.method === 'POST') {

            let body = '';

            req.on('data', (data) => body += data);
            req.on('end', () => {
                try {
                    const update = JSON.parse(body);
                    bot.receiveUpdates([update]).then(() => res.end());
                } catch (error) {
                    if (bot.logging) {
                        console.log('[bot.error.webhook]', error);
                    }
                    res.end();
                }

            });

        }

    }

};
