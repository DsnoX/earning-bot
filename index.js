require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();

// 🌐 Server
app.get("/", (req, res) => res.send("Bot Running 🚀"));
app.listen(3000);

// 🧠 DB
let users = {};

// ✅ Ensure user
function ensureUser(id) {
  if (!users[id]) {
    users[id] = { balance: 0, refs: 0 };
  }
}

// 🎯 Offers (FINAL RATES)
const offers = [
  { id: 1, name: "Slice Offer", reward: 150, link: "https://t.sliceit.com/s?c=irYwC_h&ic=DSNOX46416" },
  { id: 2, name: "TaskBucks", reward: 70, link: "http://tbk.bz/jf3gjkc9" },
  { id: 3, name: "Upstox", reward: 110, link: "https://upstox.onelink.me/0H1s/5GCLUE" }
];

// 🔥 START
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const id = msg.from.id;
  const ref = match[1];

  ensureUser(id);

  if (ref && ref != id && users[ref]) {
    users[ref].refs += 1;
  }

  bot.sendMessage(id,
`👋 Welcome!

Earn money by completing simple tasks.

📌 How it works:
• Complete tasks  
• Follow steps  
• Earn rewards  

💰 You can earn ₹10,000 to ₹12,000 per month.

👇 Use menu below`,
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

// 🎯 OFFERS
bot.onText(/🎯 Earn Money/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🔥 Featured Offers\n\nTap any offer 👇`,
    {
      reply_markup: {
        inline_keyboard: offers.map(o => ([
          { text: `💰 ₹${o.reward} - ${o.name}`, callback_data: `offer_${o.id}` }
        ]))
      }
    }
  );
});

// 📄 OFFER DETAILS
bot.on("callback_query", (q) => {
  const id = q.from.id;
  const data = q.data;

  ensureUser(id);

  if (data.startsWith("offer_")) {
    const offerId = parseInt(data.split("_")[1]);
    const offer = offers.find(o => o.id === offerId);

    bot.sendMessage(id,
`🔥 ${offer.name} - Earn ₹${offer.reward}

📋 Steps:
1️⃣ Open offer  
2️⃣ Install app  
3️⃣ Signup  
4️⃣ Complete steps  

⚡ Reward: ₹${offer.reward}

👇 Start now`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Open Offer", url: offer.link }]
          ]
        }
      }
    );
  }
});

// 💰 BALANCE
bot.onText(/💰 Balance/, (msg) => {
  const id = msg.from.id;
  ensureUser(id);

  bot.sendMessage(id,
    `💰 Balance: ₹${users[id].balance}\n👥 Referrals: ${users[id].refs}`,
    mainMenu()
  );
});

// 💸 WITHDRAW
bot.onText(/💸 Withdraw/, (msg) => {
  const id = msg.from.id;
  ensureUser(id);

  if (users[id].balance < 300) {
    return bot.sendMessage(id, "❌ Minimum ₹300 required");
  }

  if (users[id].refs < 4) {
    return bot.sendMessage(id,
      `⚠️ Invite 4 friends to unlock withdrawal`,
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "📤 Share Now",
              switch_inline_query:
`🔥 Found a simple way to earn online!

I completed some basic tasks and already reached ₹300.

Join here 👇
https://t.me/${process.env.BOT_USERNAME}?start=${id}`
            }]
          ]
        }
      }
    );
  }

  bot.sendMessage(id, "📤 Withdraw request sent");
});

// 📢 SHARE
bot.onText(/\/share/, (msg) => {
  const id = msg.from.id;

  bot.sendMessage(msg.chat.id,
`🔥 Found a simple way to earn online!

I completed some basic tasks and already reached ₹300.

Join here 👇
https://t.me/${process.env.BOT_USERNAME}?start=${id}`
  );
});
