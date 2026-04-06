require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();

// 🌐 Uptime server
app.get("/", (req, res) => res.send("Bot Running 🚀"));
app.listen(3000);

// 🧠 Simple DB
let users = {};

// 🎯 Offers (edit kar sakta hai)
const offers = [
  {
    id: 1,
    name: "Slice Offer",
    reward: 10,
    link: "https://t.sliceit.com/s?c=irYwC_h&ic=DSNOX46416"
  },
  {
    id: 2,
    name: "TaskBucks",
    reward: 10,
    link: "http://tbk.bz/jf3gjkc9"
  },
  {
    id: 3,
    name: "Upstox",
    reward: 10,
    link: "https://upstox.onelink.me/0H1s/5GCLUE"
  }
];

// 🔥 START + REFERRAL
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const id = msg.from.id;
  const ref = match[1];

  if (!users[id]) {
    users[id] = { balance: 0, done: [], refs: 0 };

    if (ref && ref != id && users[ref]) {
      users[ref].refs += 1;
    }
  }

  bot.sendMessage(id,
    `👋 Welcome!\n\n💰 Earn money by completing simple tasks`,
    mainMenu()
  );
});

// 📱 MENU
function mainMenu() {
  return {
    reply_markup: {
      keyboard: [
        ["🎯 Earn Money"],
        ["💰 Balance", "💸 Withdraw"]
      ],
      resize_keyboard: true
    }
  };
}

// 🎯 OFFERS SHOW
bot.onText(/🎯 Earn Money/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🔥 Featured Offers\n\nTap & earn instantly 👇`,
    {
      reply_markup: {
        inline_keyboard: offers.map(o => ([
          { text: `💰 ₹${o.reward} - ${o.name}`, url: o.link },
          { text: "✅ Completed", callback_data: `done_${o.id}` }
        ]))
      }
    }
  );
});

// ✅ COMPLETE TASK
bot.on("callback_query", (q) => {
  const id = q.from.id;
  const data = q.data;

  if (!users[id]) return;

  if (data.startsWith("done_")) {
    const offerId = parseInt(data.split("_")[1]);
    const offer = offers.find(o => o.id === offerId);

    if (users[id].done.includes(offerId)) {
      return bot.answerCallbackQuery(q.id, { text: "Already done ❌" });
    }

    users[id].done.push(offerId);
    users[id].balance += offer.reward;

    bot.answerCallbackQuery(q.id, {
      text: `✅ ₹${offer.reward} added`
    });
  }
});

// 💰 BALANCE
bot.onText(/💰 Balance/, (msg) => {
  const id = msg.from.id;

  bot.sendMessage(id,
    `💰 Balance: ₹${users[id].balance}\n👥 Referrals: ${users[id].refs}`,
    mainMenu()
  );
});

// 💸 WITHDRAW
bot.onText(/💸 Withdraw/, (msg) => {
  const id = msg.from.id;

  if (users[id].balance < 300) {
    return bot.sendMessage(id, "❌ Minimum ₹300 required");
  }

  if (users[id].refs < 4) {
    return bot.sendMessage(id,
      `⚠️ Withdraw unlock karne ke liye:\n\n` +
      `👉 4 friends invite karo\n\n👇 Share below`,
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "🔗 Invite Friends",
              url: `https://t.me/${process.env.BOT_USERNAME}?start=${id}`
            }]
          ]
        }
      }
    );
  }

  bot.sendMessage(id,
    `📤 Withdraw request received\n\n⏳ Processing...`
  );
});

// 📢 FORWARD MESSAGE
bot.onText(/\/share/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🔥Found a simple way to earn online!\n\n` +
    `I completed some basic tasks and already reached ₹300.\n` +
    `Process is easy and beginner-friendly.\n\n` +
    `If you want to try, join here 👇\n` +
    `https://t.me/${process.env.BOT_USERNAME}`
  );
});