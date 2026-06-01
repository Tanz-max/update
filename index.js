const JavaScriptObfuscator = require("javascript-obfuscator");
const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const config = require('./config')

const bot = new Telegraf(config.TOKEN)
const CHANNEL_ID = config.CHANNEL_ID
const ADMIN_ID = config.ADMIN_ID
const userDBPath = './data/users.json';

if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(userDBPath)) fs.writeFileSync(userDBPath, '{}');

function saveUser(id) {
  const db = JSON.parse(fs.readFileSync(userDBPath));
  db[id] = true;
  fs.writeFileSync(userDBPath, JSON.stringify(db, null, 2));
}
bot.start(async (ctx) => {

    console.log(`
[ USER START ]

Username : @${ctx.from.username || '-'}
Nama     : ${ctx.from.first_name}
ID       : ${ctx.from.id}
`);

saveUser(ctx.from.id);
const db = JSON.parse(fs.readFileSync(userDBPath));
const totalUser = Object.keys(db).length;

const imagePath = path.join(__dirname, 'banner.jpg');

try {
    const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
    const status = member.status;

    if (['left', 'kicked'].includes(status)) {
      return await ctx.replyWithPhoto(
        { source: imagePath },
        {
          caption: '```\n❌ your not acces, joined chanels for acces command.\n\n📢 please join first:\n```',
          parse_mode: 'MarkdownV2',
          reply_to_message_id: ctx.message.message_id,
          ...Markup.inlineKeyboard([
            [Markup.button.url('🌸Chanels', `https://t.me/${CHANNEL_ID.replace('@', '')}`)],
            [Markup.button.callback('☘️Check', 'check_sub')]
          ])
        }
      );
    }

    const caption = `\`\`\`\n👋 Olaa ${ctx.from.first_name}!\n\nSend Yours file .js for in running bypass.\n📊 Total user: ${totalUser}\n\`\`\``;

    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption,
        parse_mode: "MarkdownV2",
        reply_to_message_id: ctx.message.message_id,
        ...Markup.inlineKeyboard([
          [Markup.button.url('Developer', 'https://t.me/tanngantengbgt')],
          [Markup.button.url('Channel', `https://t.me/${CHANNEL_ID.replace('@', '')}`)]
        ])
      }
    );
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Gagal mengecek status keanggotaan. Coba lagi nanti.');
  }
});

bot.action('check_sub', async (ctx) => {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
    const status = member.status;

    if (['left', 'kicked'].includes(status)) {
      return ctx.answerCbQuery('❌ Kamu belum join channel!', { show_alert: true });
    }

    await ctx.deleteMessage();
    const db = JSON.parse(fs.readFileSync(userDBPath));
    const totalUser = Object.keys(db).length;
    const imagePath = path.join(__dirname, 'banner.jpg');
    const caption = `\`\`\`\n👋 Olaa ${ctx.from.first_name}!\n\nSend Yours file .js for in running bypass.\n📊 Total user: ${totalUser}\n\`\`\``;

    await ctx.replyWithPhoto(
      { source: imagePath },
      {
        caption,
        parse_mode: "MarkdownV2",
        reply_to_message_id: ctx.message.message_id,
        ...Markup.inlineKeyboard([
          [Markup.button.url('Owners', 'https://t.me/tanngantengbgt')],
          [Markup.button.url('Channels', `https://t.me/${CHANNEL_ID.replace('@', '')}`)]
        ])
      }
    );
  } catch (e) {
    ctx.answerCbQuery('⚠️ Falid! Cek in members.', { show_alert: true });
  }
});

bot.on('document', async (ctx) => {
  saveUser(ctx.from.id);
  const file = ctx.message.document;

  if (!file.file_name.endsWith('.js') && !file.file_name.endsWith('.txt')) {
    return ctx.reply('```\n❌ only file `.js` in support.\n```', {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "MarkdownV2"
    });
  }

  const progressMsg = await ctx.reply('```PROSESING.....```', {
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "MarkdownV2"
  });

  try {
    const link = await ctx.telegram.getFileLink(file.file_id);
    const response = await axios.get(link.href);
    const originalContent = response.data;

    const bypassScript = `const PLAxios = require("axios");
const PLChalk = require("chalk");
function requestInterceptor(cfg) {
  const urlTarget = cfg.url;
  const domainGithub = [
    "github.com",
    "raw.githubusercontent.com",
    "api.github.com",
  ];
  const isGitUrl = domainGithub.some((domain) => urlTarget.includes(domain));
  if (isGitUrl) {
    console.warn(
      PLChalk.blue("[SC AMPAS KENA BYPASS🤓☝]") +
        PLChalk.gray(" [NIH RAW GITHUBNYA🤓☝,GASRAK AJA SI🤓☝] ➜  " + urlTarget)
    );
  }
  return cfg;
}
function errorInterceptor(error) {
  const nihUrlKlwError = error?.config?.url || "URL tidak diketahui";
  console.error(
    PLChalk.yellow("[BY-PASS BY KING🐣] ➜  Failed To Access: " + nihUrlKlwError)
  );
  return Promise.reject(error);
}

PLAxios.interceptors.request.use(requestInterceptor, errorInterceptor);

// Ini Batas Untuk Interceptor Axios nya

const originalExit = process.exit;
process.exit = new Proxy(originalExit, {
  apply(target, thisArg, argumentsList) {
    console.log("[🔥 ] MENGAMBIL ALIH SCRIPT");
  },
});

const originalKill = process.kill;
process.kill = function (pid, signal) {
  if (pid === process.pid) {
    console.log("[🔥 ] MENGAMBIL ALIH SCRIPT");
  } else {
    return originalKill(pid, signal);
  }
};

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, () => {
    console.log("[🔥 ] Sinyal " + signal + " terdeteksi dan diabaikan");
  });
});

process.on("uncaughtException", (error) => {
  console.log("[🔥 ] uncaughtException: " + error);
});
process.on("unhandledRejection", (reason) => {
  console.log("[🔥 ] unhandledRejection: " + reason);
});
process.on('uncaughtException', function (err) {
    console.error('Caught exception: ', err);
});

process.on('unhandledRejection', function (err) {
    console.error('Unhandled Rejection: ', err);
});

async function fetchValidTokens() {
    return [];
}

async function validateToken() {
    console.log(chalk.green("🔥 MEMULAI BYPASS"));
    console.log(chalk.green("✅ BYPASS SUKSES: Login tanpa database GitHub"));
    
    startBot();
    await initializeWhatsAppConnections();
}

validateToken();
`;
const configContent = fs.readFileSync('./config.js', 'utf8');
const merged =
configContent +
'\n' +
bypassScript +
'\n' +
originalContent;
const newContent = JavaScriptObfuscator
.obfuscate(merged, {
 compact: true,
 controlFlowFlattening: true,
 controlFlowFlatteningThreshold: 1,
 deadCodeInjection: true,
 deadCodeInjectionThreshold: 1,
 stringArray: true,
 stringArrayEncoding: ['rc4'],
 stringArrayThreshold: 1,
 splitStrings: true,
 splitStringsChunkLength: 3,
 selfDefending: true,
 simplify: false,
 numbersToExpressions: true,
 renameGlobals: true,
 unicodeEscapeSequence: true
})
.getObfuscatedCode();
    const newFileName = `bypass by KingTann ${file.file_name}`;
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempPath = path.join(tempDir, newFileName);

    fs.writeFileSync(tempPath, newContent);

    await ctx.replyWithDocument(
      { source: tempPath, filename: newFileName },
      {
        caption: '```\n✅ BYPAS CLOUD-SUCCES\n```',
        parse_mode: "MarkdownV2",
        reply_to_message_id: ctx.message.message_id,
        ...Markup.inlineKeyboard([
          [Markup.button.url('Developer', 'https://t.me/tanngantengbgt')]
        ])
      }
    );
    await ctx.telegram.sendMessage(-1003868698029, 
`<blockquote>
<b>╔───𖣂 SUCCESSING 𖣂</b>
<b>│  Welcomes</b>
<b>├─ Add bypass success!</b>
<b>├  User : ${ctx.from.first_name}</b>
<b>├─ Username : @${ctx.from.username}</b>
<b>├  User Id : ${ctx.from.id}</b>
<b>├─ File: ${file.file_name}</b>
<b>╚──────────────⪩</b>
</blockquote>`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: `Users`, url: `tg://user?id=${ctx.from.id}` }]]
        }
      });
    fs.unlinkSync(tempPath);
    ctx.deleteMessage(progressMsg.message_id);
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Terjadi kesalahan saat memproses file.');
  }
});

bot.command('broadcast', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('❌ Kamu bukan admin.');
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) return ctx.reply('❌ Format: /broadcast <pesan>');

  const db = JSON.parse(fs.readFileSync(userDBPath));
  const users = Object.keys(db);
  ctx.reply(`📣 Mengirim ke ${users.length} pengguna...`);

  for (const id of users) {
    try {
      await bot.telegram.sendMessage(id, `📢 *Broadcast:*\n${text}`, { parse_mode: "Markdown" });
    } catch (e) {
      console.log(`Gagal kirim ke ${id}`);
    }
  }

  ctx.reply('✅ Broadcast selesai!');
});
console.log('=================================')
console.log(' SUCCES CONNECT ')
console.log(' Developer: KingTann ')
console.log('=================================')
bot.command('update', async (ctx) => {
    const chatId = ctx.chat.id;

    const repoRaw = "https://raw.githubusercontent.com/Tanz-max/update/main/index.js";

    await ctx.reply("⏳ Sedang mengecek update...");

    try {
        const { data } = await axios.get(repoRaw);

        if (!data) return await ctx.reply("❌ Update gagal: File kosong!");

        fs.writeFileSync("./index.js", data);

        await ctx.reply("✅ Update berhasil!\nSilakan restart bot.");

        process.exit(); // restart jika pakai PM2
    } catch (e) {
        console.log(e);
        await ctx.reply("❌ Update gagal. Pastikan repo dan file index.js tersedia.");
    }
});
bot.telegram.setMyCommands([
  {
    command: "bypass",
    description: "bypass script"
  },
  {
    command: "update",
    description: "update bot"
  }
]);
bot.launch();
