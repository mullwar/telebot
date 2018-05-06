const TeleBot = require('../');
const request = require('request');

const bot = new TeleBot({
    token: '585531733:AAHQzJX8Rl6Z0KCVg5SvOghcQZnM6puwIuQ',
    usePlugins: ['askUser']
});

const parseMode = "Markdown";

const supervisors = [{
  username: "nashr3",
  kids: [
    "rizalasrul",
    "dinaelita",
  ]}, {
  username: "xiaola",
  kids: [
    "rcdzh",
    "adzil",
  ],
}];

bot.on('/start', msg => {
    const chatId = msg.from.id;

    // Ask user name
    bot.sendMessage(chatId, 'Untuk berinteraksi denganku, kamu dapat menggunakan perintah _/cuti_, _/remote_, _/gh_, atau _/status_', {parseMode});
    bot.sendMessage(chatId, 'Hai. Selamat datang di BukaHari. Aku akan membantu kamu untuk melakukan perijinan.\nAtasan kamu: *@nashr3*', {parseMode});

});

bot.on('/help', msg => {
    const chatId = msg.from.id;

    // Ask user name
    bot.sendMessage(chatId, `*BukaHari Bot*\n\n*Perintah*\n/cuti - Untuk mengajukan cuti\n/remote - Untuk mengajukan kerja remote\n/gh - Untuk mengajukan ganti hari\n/status - Untuk melihat sisa cuti kamu\n/help - Untuk meminta bantuanku\n\nSilakan pakai aku yaa`, {parseMode});

});
// On every text message
// bot.on("/start", msg => {
//   const chatId = msg.from.id;
//   const username = msg.chat.username;
//   request.post('https://jsonplaceholder.typicode.com/posts', JSON.stringify({
//       title: 'dede',
//       body: 'badeder',
//       userdId: 1
//     }),function (error, response, body) {
//     console.log('error:', error); // Print the error if one occurred
//     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//     console.log('body:', body); // Print the HTML for the Google homepage.
//   });

// });
bot.connect();
