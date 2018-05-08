const TeleBot = require('../');
const request = require('request');

const bot = new TeleBot({
    token: '585531733:AAHQzJX8Rl6Z0KCVg5SvOghcQZnM6puwIuQ',
    usePlugins: ["askUser", "commandButton"],
});

const parseMode = "Markdown";
const auth = {
  user: 'bukahari@bukalapak.com',
  pass: 'nktb2018',
  sendImmediately: false,
};
const SUPERVISORS = [
  {
    username: "nashr3",
    kids: [
      "rizalasrul",
      "dinaelita",
    ],
  },
  {
    username: "xiaola",
    kids: [
      "rcdzh",
      "adzil",
    ],
  },
];

const PERSONELS = [{
  username: "rizalasrul",
  annualLeave: {
    current: 5,
    dates: [],
    pendingDates: [],
  }}, {
  username: "adzil",
  annualLeave: {
    current: 1,
    dates: [],
    pendingDates: [],
  }}, {
  username: "dinaelita",
  annualLeave: {
    current: 13,
    dates: [],
    pendingDates: [],
  }}, {
  username: "rcdzh",
  annualLeave: {
    current: 1,
    dates: [],
    pendingDates: [],
  },
}];

bot.on("/start", msg => {
  const chatId = msg.from.id;
  return bot.sendMessage(chatId, "Hai. Selamat datang di BukaHari. Aku akan membantu kamu untuk melakukan perijinan.\n\nOh iya, pertama-tama, kamu harus masukkan data gender dan tanggal join kamu dengan format `[gender] [tanggal join]`\nContoh `L 2018-01-21`.", {parseMode, ask: "firstdata"});
});

bot.on("ask.firstdata", msg => {
  const chatId = msg.from.id;
  const username = msg.chat.username;
  const name = `${msg.from.first_name} ${msg.from.last_name}`;
  const gender = msg.text.split(/\s+/)[0] === 'L' ? "male" : "female";
  const joinDate = msg.text.split(/\s+/)[1];

  const form = {
    username,
    chat_id: chatId,
    name,
    gender,
    join_date: joinDate,
  };

  request.post("http://bukahari-server.test/api/employee", { auth, form }, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log(body);
  });
  return bot.sendMessage(chatId, `Selamat! Kakak sudah terdaftar di sistem aku, dengan data:\nNama: ${name}\nJenis Kelamin: ${gender}\nTanggal Join: ${joinDate}\n\nSilakan gunakan perintah \`/help\` untuk mengenal aku lebih jauh ya.`, {parseMode});
});

bot.on("/help", msg => {
  const chatId = msg.from.id;

  return bot.sendMessage(chatId, `*BukaHari Bot*\n\n*Perintah*\n/leave - Untuk mengajukan cuti\n/quotaleave - Untuk melihat sisa cuti kamu\n/quotagh - Untuk melihat sisa ganti hari\n/help - Untuk meminta bantuanku\n\nSilakan pakai aku yaa`, {parseMode});
});

bot.on("/sisacuti", msg => {
  const chatId = msg.from.id;
  const username = msg.chat.username;
  const personel = searchPersonel(username);

  return bot.sendMessage(chatId, `Halo kakak @${username}, sisa cuti kamu sebanyak *${personel.annualLeave.current}*. Gunakan sebaik-baiknya yaa`, {parseMode});
});

bot.on("/mapping", msg => {
  const chatId = msg.from.id;
  const supervisorUsername = msg.text.split(/\s+/)[1];
  const username = msg.text.split(/\s+/)[2];
  const form = {
    username,
    supervisor_username: supervisorUsername,
  };
  request.post("http://bukahari-server.test/api/employee-update", { auth, form }, function (error, response, body) {
    console.log(body);
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });
});

bot.on("/cuti", msg => {
  const chatId = msg.from.id;
  const username = msg.from.username;
  request.get(`http://bukahari-server.test/api/employee-leave?username=${username}`, { auth, }, function (error, response, body) {
    const categories = JSON.parse(body);
    const categoryButtons = [];
    categories.forEach(({category, remaining_quota}, idx) => {
      categoryButtons.push([ bot.inlineButton(`${category.replace(/_/i, " ")} (Sisa: ${remaining_quota})`, {callback: `/applycuti ${category} ${username}`})]);
    });
    const replyMarkup = bot.inlineKeyboard(categoryButtons);
    bot.sendMessage(msg.from.id, `Ini daftar cuti kamu.`, {replyMarkup, parseMode});
    console.log(body);
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });
  const replyMarkup = bot.inlineKeyboard([
    [ bot.inlineButton("Annual Leave (Sisa: 13)", {callback: "/cuti annual"}), ],
    [ bot.inlineButton("Cuti Menikah", {callback: "/cuti menikah"}), ],
    [ bot.inlineButton("Cuti Melahirkan", {callback: "/cuti melahirkan"}), ],
    [ bot.inlineButton("Cuti Saudara Meninggal", {callback: "/cuti meninggal"}), ],
  ]);
  bot.sendMessage(msg.from.id, `Ini daftar cuti kamu.`, {replyMarkup, parseMode});
  //const form = { username };
  // request.get("http://bukahari-server.test/api/leave-request", { auth, form }, function (error, response, body) {
  //   console.log(body);
  //   console.log('error:', error); // Print the error if one occurred
  //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  // });
});

bot.on("/addcuti", msg => {
  const chatId = msg.from.id;
  const spreadMsg = msg.text.split(/\s+/);
  const category = spreadMsg[1];
  const quota = spreadMsg[2];
  const resetByTime = spreadMsg[3] || 0;
  const resetByUsage = spreadMsg[4] || 0;
  const policy = "";
  const form = {
    category,
    quota,
    policy,
    reset_by_time: resetByTime,
    reset_by_usage: resetByUsage,
  }
  request.post("http://bukahari-server.test/api/leave", { auth, form }, function (error, response, body) {
    console.log(body);
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });
  bot.sendMessage(chatId, `Kamu berhasil menambahkan tipe cuti.`, {parseMode});
});

bot.on("/assigncuti", msg => {
  const chatId = msg.from.id;
  const username = msg.text.split(/\s+/)[1];
  console.log(username);
  request.get("http://bukahari-server.test/api/leave-category", { auth }, function (error, response, body) {
    const categories = JSON.parse(body);
    const categoryButtons = [];
    categories.forEach((category, idx) => {
      categoryButtons.push([ bot.inlineButton(category.replace(/_/i, " "), {callback: `/choosecuti ${category} ${username}`})]);
    });
    const replyMarkup = bot.inlineKeyboard(categoryButtons);
    bot.sendMessage(msg.from.id, `Ini daftar cuti yang tersedia.`, {replyMarkup, parseMode}).
      catch((err) => {console.log(err)});
    console.log(body);
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  });
});

bot.on("/pending", msg => {
  const replyMarkup = bot.inlineKeyboard([
    [ bot.inlineButton("Rizal Asrul Pambudi - 2018-05-09 (1 hari)", {callback: "/detail rizalasrul 1"}), ],
    [ bot.inlineButton("Rizal Asrul Pambudi - 2018-06-11 (9 hari)", {callback: "/detail rizalasrul 2"}), ],
  ]);

  // Send message with keyboard markup
  return bot.sendMessage(msg.from.id, `Ini daftar pengajuan cuti yang bisa kamu approve.`, {replyMarkup});
});

bot.on('callbackQuery', msg => {
  const spreadMsg = msg.data.split(/\s+/);
  console.log(msg)
  if (spreadMsg[0] === "/detail") {
    const replyMarkup = bot.keyboard([
      ["/yes", "/no"]
    ], {resize: true});
    console.log(replyMarkup);
    return bot.sendMessage(msg.from.id, `Hai kakak. Ini adalah detail data pengajuan cuti dari kakak @rizalasrul.\nNama: Rizal Asrul Pambudi\nTanggal Mulai Cuti: 2018-05-09\nJumlah Hari: 1\nAlasan: Ingin bersenang-senang\n\nSilakan diapprove ya.`, {replyMarkup, parseMode});
  } else if (spreadMsg[0] === "/yes") {
    return bot.sendMessage(msg.from.id, `Terima kasih ya kak sudah merespon. Nanti aku bantu forward ke kakak yang bersangkutan yaa. Terima kasih yaa`, {parseMode});
  } else if (spreadMsg[0] === "/no") {
    return bot.sendMessage(msg.from.id, `Terima kasih ya kak sudah merespon. Nanti aku bantu forward ke kakak yang bersangkutan yaa. Terima kasih yaa`, {parseMode});
  } else if (spreadMsg[0] === "/cuti") {
    bot.sendMessage(msg.from.id, `Terima kasih ya kak sudah submit cuti. Nanti aku bantu forward ke kakak yang bersangkutan yaa. Terima kasih yaa`, {parseMode});
    bot.sendMessage(411273384, `Hai kak. Ini ada pengajuan cuti dari kakak @rizalsrul. Bisa cek di /pending yaa untuk detailnya.`, {parseMode});
  } else if (spreadMsg[0] === "/choosecuti") {
    const form = {
      username: spreadMsg[2],
      leave_category: spreadMsg[1],
    };
    request.post("http://bukahari-server.test/api/employee-leave", { auth, form, }, function (error, response, body) {
      bot.sendMessage(msg.from.id, `Tipe cuti berhasil ditambahkan untuk @${form.username}.`, { parseMode });
      console.log(body);
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    });
  } else if (spreadMsg[0] === "/applycuti") {
    const category = spreadMsg[1];
    const username = spreadMsg[2];
    bot.sendMessage(msg.from.id, `Silakan masukkan tanggal cuti beserta jumlah hari cutinya ya. Dengan format \`YYYY-MM-DD tipe_cuti\`.\nContoh: \`2018-10-20 full|half\``, {parseMode});
  }
});

bot.on("/yes", msg => {
  bot.sendMessage(msg.from.id, `Terima kasih ya kak sudah merespon. Nanti aku bantu forward ke kakak yang bersangkutan yaa. Terima kasih yaa`, {parseMode});
  bot.sendMessage(113569276, `Wah pengajuan cuti kakak sudah diapprove nih sama kak @nashr3. Selamat cuti ya kak.`, {parseMode});
});

bot.on("/no", msg => {
  bot.sendMessage(msg.from.id, `Terima kasih ya kak sudah merespon. Nanti aku bantu forward ke kakak yang bersangkutan yaa. Terima kasih yaa`, {parseMode});
  bot.sendMessage(113569276, `Sepertinya pengajuan cuti kakak ditolak nih sama kak @nashr3. Nanti bisa langsung ngobrol sama yang bersangkutan aja ya kak.`, {parseMode});
});

function searchPersonel(username) {
  return PERSONELS.find(personel => personel.username === username);
}

bot.connect();
