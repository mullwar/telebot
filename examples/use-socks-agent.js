const TeleBot = require('../');
const SocksProxyAgent = require('socks-proxy-agent');

const socks_proxy = 'socks://127.0.0.1:1080',
    socks_agent = new SocksProxyAgent(socks_proxy);

const bot = new TeleBot({
    token: 'TELEGRAM_BOT_TOKEN',
    agent: socks_agent
});

// On every text message
bot.on('text', msg => {
    let id = msg.from.id;
    let text = msg.text;
    return bot.sendMessage(id, `You said: ${text}`);
});

bot.connect();
